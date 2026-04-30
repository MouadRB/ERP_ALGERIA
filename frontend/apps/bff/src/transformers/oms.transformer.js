// ─────────────────────────────────────────────────────────────────────────────
// Engine-A OMS transformers
//
// Engine-A is the SINGLE source of truth for OMS. Its DTOs use UPPER_SNAKE
// enums (DRAFT, RESERVED, CONFIRMED, PACKED, SHIPPED, DELIVERED, RETURNED,
// CANCELLED, REJECTED) and field names like `orderId`, `wilayaCode`,
// `shippingAddress`, `items[].skuCode`, `items[].unitPrice`.
//
// The frontend (kept untouched) speaks French/PascalCase status names
// ("AwaitingValidation", "Confirmed", "DeliveredCOD_Confirmed", …) and field
// names like `nomComplet`, `telephone`, `adresse`, `items[].sku`.
//
// This module owns the bridge:
//   • inbound  : frontend body → Engine-A request DTO
//   • outbound : Engine-A response → frontend order shape
//   • status   : enum dictionaries (both directions) used everywhere
// ─────────────────────────────────────────────────────────────────────────────

// ── Status dictionaries ─────────────────────────────────────────────────────
// Engine-A enum → frontend label.
// Engine-A only exposes the high-level states; the frontend has finer-grained
// states (AwaitingPickup, OutForDelivery, COD_Remitted, …) that we cannot
// invent. We pick the single closest representative for each.
const STATUS_FROM_ENGINE = {
  DRAFT: 'Draft',
  RESERVED: 'AwaitingValidation',
  CONFIRMED: 'Confirmed',
  PACKED: 'AwaitingPickup',
  SHIPPED: 'HandedToCarrier',
  DELIVERED: 'DeliveredCOD_Confirmed',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
  REJECTED: 'Cancelled',
};

// Frontend label → Engine-A enum. Accepts the rich frontend vocabulary plus a
// few French aliases ("Confirmee", "EnLivraison") that show up in URL filters.
const STATUS_TO_ENGINE = {
  Draft: 'DRAFT',
  Brouillon: 'DRAFT',
  AwaitingValidation: 'RESERVED',
  Reserved: 'RESERVED',
  Reservee: 'RESERVED',
  Confirmed: 'CONFIRMED',
  Confirmee: 'CONFIRMED',
  Confirmees: 'CONFIRMED',
  AwaitingPickup: 'PACKED',
  Packed: 'PACKED',
  Empaquete: 'PACKED',
  HandedToCarrier: 'SHIPPED',
  OutForDelivery: 'SHIPPED',
  Shipped: 'SHIPPED',
  EnLivraison: 'SHIPPED',
  DeliveryFailed_Absent: 'SHIPPED',
  DeliveredCOD_Confirmed: 'DELIVERED',
  COD_Remitted: 'DELIVERED',
  Delivered: 'DELIVERED',
  Livre: 'DELIVERED',
  Livree: 'DELIVERED',
  Returned: 'RETURNED',
  Retour: 'RETURNED',
  ReturnInTransit_Refused: 'RETURNED',
  LostInTransit: 'REJECTED',
  Cancelled: 'CANCELLED',
  Annule: 'CANCELLED',
  Annulee: 'CANCELLED',
  Rejected: 'REJECTED',
  Rejete: 'REJECTED',
};

const PAYMENT_METHOD_TO_ENGINE = {
  COD: 'COD',
  cod: 'COD',
  card: 'CARD',
  CARD: 'CARD',
  bank: 'BANK_TRANSFER',
  bank_transfer: 'BANK_TRANSFER',
  BANK_TRANSFER: 'BANK_TRANSFER',
};

const CHANNEL_TO_ENGINE = {
  website: 'WEBSITE',
  web: 'WEBSITE',
  'saisie manuelle': 'WEBSITE',
  manual: 'WEBSITE',
  facebook: 'FACEBOOK',
  fb: 'FACEBOOK',
  instagram: 'INSTAGRAM',
  ig: 'INSTAGRAM',
  whatsapp: 'WHATSAPP',
  whats: 'WHATSAPP',
};

const mapStatusToEngine = (status) => {
  if (!status) return undefined;
  if (Array.isArray(status)) {
    return status.map(mapStatusToEngine).filter(Boolean);
  }
  return STATUS_TO_ENGINE[status] || (typeof status === 'string' ? status.toUpperCase() : undefined);
};

const mapStatusFromEngine = (status) => {
  if (!status) return null;
  return STATUS_FROM_ENGINE[status] ?? status;
};

const mapChannelToEngine = (source) => {
  if (!source) return 'WEBSITE';
  const key = String(source).trim().toLowerCase();
  return CHANNEL_TO_ENGINE[key] || (key.includes('whats') ? 'WHATSAPP' : 'WEBSITE');
};

const mapPaymentMethodToEngine = (method) => {
  if (!method) return 'COD';
  return PAYMENT_METHOD_TO_ENGINE[method] || PAYMENT_METHOD_TO_ENGINE[String(method).toLowerCase()] || 'COD';
};

const numberOrZero = (v) => {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// ── Inbound: frontend → Engine-A ────────────────────────────────────────────

// POST /oms/v1/orders body — must match Engine-A's PlaceOrderCommand:
//   required at root: paymentMethod, shippingAddress, subtotalHt, taxTotal,
//                     shippingFee, grandTotalTtc
//   lines[].required: unitPriceHt, unitPriceTtc
//   AddressCommand:   recipientName, phone, wilayaCode, commune, line1, …
// The frontend sends prices as TTC. We derive HT using the standard 19% TVA
// rate (matches transformOrderItem on the outbound side) and total up the
// envelope so Engine-A's bean validation passes.
const TVA_RATE = 0.19;

const buildCreateOrderRequest = (payload = {}) => {
  const lines = (payload.items ?? []).map((line) => {
    const quantity = Number(line.quantity ?? line.qty ?? 1);
    const unitPriceTtc = numberOrZero(
      line.unitPrice ?? line.unitPriceTtc ?? line.priceTTC ?? line.prixUnitTTC,
    );
    const unitPriceHt = line.unitPriceHt != null
      ? numberOrZero(line.unitPriceHt)
      : Math.round((unitPriceTtc / (1 + TVA_RATE)) * 100) / 100;
    return {
      skuCode: line.sku ?? line.skuCode,
      variantId: line.variantId ?? undefined,
      productNameFr: line.nameFr ?? line.productNameFr ?? undefined,
      productNameAr: line.nameAr ?? line.productNameAr ?? undefined,
      taxRuleCode: line.taxRuleCode ?? 'STANDARD',
      quantity,
      unitPriceHt,
      unitPriceTtc,
    };
  });

  const subtotalHt = lines.reduce((s, l) => s + l.unitPriceHt * l.quantity, 0);
  const subtotalTtc = lines.reduce((s, l) => s + l.unitPriceTtc * l.quantity, 0);
  const taxTotal = Math.round((subtotalTtc - subtotalHt) * 100) / 100;
  const shippingFee = numberOrZero(payload.shippingFee);
  const grandTotalTtc = Math.round((subtotalTtc + shippingFee) * 100) / 100;

  return {
    channelCode: mapChannelToEngine(payload.source),
    externalOrderRef: payload.externalOrderRef ?? undefined,
    customerId: payload.customerId ?? undefined,
    paymentMethod: mapPaymentMethodToEngine(payload.paymentMethod),
    currency: payload.currency ?? 'DZD',
    subtotalHt: Math.round(subtotalHt * 100) / 100,
    taxTotal,
    shippingFee,
    grandTotalTtc,
    shippingAddress: {
      recipientName: payload.nomComplet ?? payload.customerName ?? '',
      phone: payload.telephone ?? payload.phone ?? '',
      wilayaCode: payload.wilayaCode,
      commune: payload.commune ?? payload.city ?? '',
      line1: payload.adresse ?? payload.address ?? '',
      line2: payload.adresse2 ?? payload.line2 ?? undefined,
      postalCode: payload.postalCode ?? undefined,
      notes: payload.noteInterne ?? payload.notes ?? undefined,
    },
    lines,
  };
};

// Map list/search query from frontend → Engine-A search query.
//   Frontend  : { search, status, wilaya, customerId, page, pageSize }
//   Engine-A  : { q, status, wilaya_code, channel_code, customer_id,
//                 payment_method, page, size }
const buildSearchQuery = ({
  search,
  q,
  status,
  wilaya,
  wilayaCode,
  customerId,
  channel,
  channelCode,
  paymentMethod,
  page = 1,
  pageSize = 20,
} = {}) => {
  const query = {
    page: Math.max(0, Number(page) - 1),
    size: Number(pageSize),
  };
  const term = q || search;
  if (term) query.q = term;

  const engineStatus = mapStatusToEngine(status);
  if (engineStatus) {
    query.status = Array.isArray(engineStatus) ? engineStatus.join(',') : engineStatus;
  }

  const wc = wilayaCode || wilaya;
  if (wc) query.wilaya_code = wc;

  const cc = channelCode || (channel ? mapChannelToEngine(channel) : undefined);
  if (cc) query.channel_code = cc;

  if (customerId) query.customer_id = customerId;

  if (paymentMethod) query.payment_method = mapPaymentMethodToEngine(paymentMethod);

  return query;
};

// Cancel: frontend body has { reason }. Engine-A wants reasonCode + reasonMessage
// as query parameters.
const buildCancelQuery = ({ reason, reasonCode, reasonMessage } = {}) => {
  const code = reasonCode || 'MANUAL_CANCEL';
  const message = reasonMessage || reason || '';
  return { reasonCode: code, reasonMessage: message };
};

// ── Outbound: Engine-A → frontend ───────────────────────────────────────────

const transformOrderItem = (line = {}) => {
  const qty = numberOrZero(line.quantity ?? line.qty);
  const unitPriceTTC = numberOrZero(line.unitPrice ?? line.unitPriceTTC ?? line.prixUnitTTC);
  const unitPriceHT = line.unitPriceHT != null
    ? numberOrZero(line.unitPriceHT)
    : Math.round(unitPriceTTC / 1.19);
  return {
    productId: line.productId ?? line.skuCode ?? null,
    sku: line.skuCode ?? line.sku,
    nameFr: line.nameFr ?? line.productName ?? line.name ?? null,
    nameAr: line.nameAr ?? '',
    quantity: qty,
    qty,
    unitPriceHT,
    unitPriceTTC,
    prixUnitTTC: unitPriceTTC,
    tvaRate: line.tvaRate ?? 'standard',
    total: unitPriceTTC * qty,
  };
};

const transformOrder = (raw) => {
  if (!raw) return null;

  const items = (raw.items ?? raw.lines ?? []).map(transformOrderItem);
  const totalTTC = raw.totalAmount != null
    ? numberOrZero(raw.totalAmount)
    : items.reduce((s, it) => s + (it.total || 0), 0);
  const totalHT = raw.totalAmountHT != null
    ? numberOrZero(raw.totalAmountHT)
    : Math.round(totalTTC / 1.19);
  const totalTVA = totalTTC - totalHT;

  const shipping = raw.shippingAddress ?? raw.deliveryAddress ?? {};
  const status = mapStatusFromEngine(raw.status ?? raw.state);

  return {
    id: raw.orderId ?? raw.id,
    reference: raw.reference ?? raw.orderReference ?? raw.orderId ?? null,
    status,
    rawStatus: raw.status ?? raw.state ?? null,

    customerId: raw.customerId ?? null,
    customerPhone: shipping.phone ?? raw.customerPhone ?? null,
    customerNameFr: raw.customerName ?? raw.customer?.fullNameFr ?? raw.customer?.fullName ?? null,
    customerNameAr: raw.customer?.fullNameAr ?? '',

    wilayaCode: shipping.wilayaCode ?? raw.wilayaCode ?? null,
    address: shipping.street ?? raw.address ?? null,
    commune: shipping.city ?? raw.commune ?? null,

    source: raw.channelCode ?? raw.source ?? null,
    channelCode: raw.channelCode ?? null,
    paymentMethod: raw.paymentMethod ?? 'COD',
    noteInterne: raw.notes ?? raw.noteInterne ?? null,

    items,
    totalHT,
    totalTVA,
    totalTTC,
    codAmount: numberOrZero(raw.codAmount ?? raw.totalAmount ?? totalTTC),
    revenueRecognizedAt: raw.revenueRecognizedAt ?? null,

    carrier: raw.carrierCode ?? raw.carrier ?? null,
    trackingNumber: raw.trackingNumber ?? raw.shipment?.trackingNumber ?? null,
    deliveryAttempts: numberOrZero(raw.deliveryAttempts),
    autoCancelAt: raw.autoCancelAt ?? null,

    riskLevel: raw.riskLevel ?? 'LOW',
    fraudScore: raw.fraudScore ?? null,
    confirmedBy: raw.confirmedBy ?? null,
    cancelReason: raw.cancelReason ?? raw.reasonMessage ?? null,
    returnOutcome: raw.returnOutcome ?? null,

    tracking: {
      carrier: raw.carrierCode ?? raw.carrier ?? null,
      trackingNumber: raw.trackingNumber ?? raw.shipment?.trackingNumber ?? null,
      events: raw.tracking?.events ?? raw.shipmentEvents ?? [],
      attempts: raw.tracking?.attempts ?? raw.deliveryAttemptsLog ?? [],
    },
    paiement: {
      totalHT,
      totalTVA,
      totalTTC,
      codAmount: numberOrZero(raw.codAmount ?? totalTTC),
      paymentStatus: raw.paymentStatus ?? null,
      revenueRecognizedAt: raw.revenueRecognizedAt ?? null,
      carrierRemittance: raw.carrierRemittance ?? null,
    },
    history: raw.statusHistory ?? raw.history ?? [],

    createdBy: raw.createdBy ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? raw.createdAt ?? null,
  };
};

const transformOrderList = (rawList = []) => (rawList || []).map(transformOrder);

// ── Pagination (Spring page or ApiResult pagination envelope) ───────────────

const transformPagination = (raw, fallback = { page: 1, pageSize: 20 }) => {
  if (!raw) {
    return { total: 0, page: fallback.page, pageSize: fallback.pageSize, totalPages: 0 };
  }
  if (Array.isArray(raw.content)) {
    return {
      total: numberOrZero(raw.totalElements),
      page: numberOrZero(raw.number) + 1,
      pageSize: numberOrZero(raw.size) || fallback.pageSize,
      totalPages: numberOrZero(raw.totalPages),
    };
  }
  if ('totalElements' in raw || 'page' in raw) {
    return {
      total: numberOrZero(raw.totalElements),
      page: numberOrZero(raw.page) + 1,
      pageSize: numberOrZero(raw.size) || fallback.pageSize,
      totalPages: numberOrZero(raw.totalPages),
    };
  }
  return { total: 0, page: fallback.page, pageSize: fallback.pageSize, totalPages: 0 };
};

// Wrap orders into the standard `{ data, meta }` envelope. Accepts both
// envelope shapes returned by engine-a.client (Spring page or ApiResult.paged).
const transformPagedOrders = ({ data, pagination } = {}, fallback) => {
  if (data && Array.isArray(data.content)) {
    return {
      data: transformOrderList(data.content),
      meta: transformPagination(data, fallback),
    };
  }
  return {
    data: transformOrderList(Array.isArray(data) ? data : []),
    meta: transformPagination(pagination, fallback),
  };
};

// ── Returns ─────────────────────────────────────────────────────────────────

const RETURN_STATUS_FROM_ENGINE = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PICKED_UP: 'picked_up',
  CLOSED: 'closed',
};

const transformReturn = (raw = {}) => {
  if (!raw) return null;
  return {
    id: raw.returnId ?? raw.id,
    returnId: raw.returnId ?? raw.id,
    orderId: raw.orderId ?? null,
    orderRef: raw.orderReference ?? null,
    reason: raw.reason ?? raw.returnReason ?? null,
    raisonRetour: raw.reason ?? raw.returnReason ?? null,
    raisonCategory: raw.category ?? null,
    status: RETURN_STATUS_FROM_ENGINE[raw.status] ?? (raw.status || '').toLowerCase(),
    rawStatus: raw.status ?? null,
    items: raw.items ?? [],
    requestedAt: raw.requestedAt ?? raw.createdAt ?? null,
    returnedAt: raw.returnedAt ?? null,
    inspectedAt: raw.inspectedAt ?? null,
  };
};

// ── Action mapping for return-action composite ──────────────────────────────
// Frontend talks "reintegrate / declare_loss / resend".
// Engine-A only knows approve / reject. We map intent → decision.
const RETURN_ACTION_TO_DECISION = {
  reintegrate: 'approve',
  resend: 'approve',
  declare_loss: 'reject',
};

const mapReturnActionToDecision = (action) => RETURN_ACTION_TO_DECISION[action] ?? null;

// ── Error normalization ─────────────────────────────────────────────────────
//
// Engine-A error envelope: { success: false, errors: { field: msg }, message }
// BFF surface format    : { error: { code, message, field } }
//
// engine-a.client already throws AppError on non-2xx — this helper exists for
// any code path that needs to project the envelope manually (logging,
// debugging, fallback rendering).
const transformEngineError = (raw = {}) => {
  if (!raw || raw.success !== false) return null;
  const fieldErrors = raw.errors || {};
  const firstField = Object.keys(fieldErrors)[0];
  return {
    error: {
      code: raw.code || 'ENGINE_A_ERROR',
      message: raw.message || (firstField ? fieldErrors[firstField] : 'Erreur Engine-A.'),
      field: firstField,
    },
  };
};

// ── Standard envelope helper ────────────────────────────────────────────────
//
// Use this when a service computes `{ data, meta }` manually so all responses
// share one shape downstream.
const buildEnvelope = (data, meta = undefined) =>
  meta === undefined ? { data } : { data, meta };

module.exports = {
  // status maps
  STATUS_FROM_ENGINE,
  STATUS_TO_ENGINE,
  PAYMENT_METHOD_TO_ENGINE,
  CHANNEL_TO_ENGINE,
  RETURN_STATUS_FROM_ENGINE,
  RETURN_ACTION_TO_DECISION,
  // mappers
  mapStatusToEngine,
  mapStatusFromEngine,
  mapChannelToEngine,
  mapPaymentMethodToEngine,
  mapReturnActionToDecision,
  // inbound (frontend → Engine-A)
  buildCreateOrderRequest,
  buildSearchQuery,
  buildCancelQuery,
  // outbound (Engine-A → frontend)
  transformOrder,
  transformOrderList,
  transformOrderItem,
  transformPagedOrders,
  transformPagination,
  transformReturn,
  // errors / envelope
  transformEngineError,
  buildEnvelope,
};
