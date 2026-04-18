const env = require('../config/env');
const { computeStats } = require('./oms-stats.service');
const { computeQueue } = require('./oms-queue.service');
const { computeCarrierSuivi } = require('./oms-suivi.service');
const { computeAnalytics } = require('./oms-analytics.service');
const {
  enrichOrder,
  enrichOrderItems,
  validateOrderAgainstCatalogue,
  deductStockForOrder,
  quarantineStockForOrder,
} = require('./cross-module.helpers');
const { AppError } = require('../errors/AppError');

const mockOrders = () => require('../mocks/oms-orders.mock');
const pimProducts = () => require('../mocks/pim.mock').products;

const nextOrderSequence = (orders) => {
  const max = orders.reduce((acc, o) => {
    const ref = o.reference || '';
    const match = ref.match(/ORD-\d{4}-(\d+)/i);
    if (!match) return acc;
    const num = parseInt(match[1], 10);
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 0);
  return max + 1;
};

const padSeq = (n, len = 5) => String(n).padStart(len, '0');

const normalizeList = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const sortOrders = (orders, sort) => {
  const sorted = [...orders];
  switch (sort) {
    case 'montant':
      sorted.sort((a, b) => (b.codAmount ?? 0) - (a.codAmount ?? 0));
      break;
    case 'statut':
      sorted.sort((a, b) => a.status.localeCompare(b.status));
      break;
    case 'wilaya':
      sorted.sort((a, b) =>
        (a.wilayaCode ?? '').localeCompare(b.wilayaCode ?? ''),
      );
      break;
    case 'date_desc':
    default:
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
  }
  return sorted;
};

const filterOrders = (
  orders,
  { status, carrier, wilaya, search, dateFrom, dateTo, codMin, codMax, riskLevel, source, attempts, hasCarrier, sort, customerId },
) => {
  let filtered = orders;
  if (customerId) filtered = filtered.filter((o) => o.customerId === customerId);
  if (status) filtered = filtered.filter((o) => o.status === status);
  if (carrier) filtered = filtered.filter((o) => o.carrier === carrier);
  if (wilaya) {
    filtered = filtered.filter(
      (o) => (o.wilayaCode ?? o.customer?.wilayaCode) === wilaya,
    );
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.customerNameFr.toLowerCase().includes(q) ||
        o.customerPhone.includes(q),
    );
  }

  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!Number.isNaN(from.getTime())) {
      filtered = filtered.filter((o) => new Date(o.createdAt) >= from);
    }
  }
  if (dateTo) {
    const to = new Date(dateTo);
    if (!Number.isNaN(to.getTime())) {
      filtered = filtered.filter((o) => new Date(o.createdAt) <= to);
    }
  }
  if (typeof codMin === 'number') {
    filtered = filtered.filter((o) => (o.codAmount ?? 0) >= codMin);
  }
  if (typeof codMax === 'number') {
    filtered = filtered.filter((o) => (o.codAmount ?? 0) <= codMax);
  }
  const riskLevels = normalizeList(riskLevel);
  if (riskLevels && riskLevels.length > 0) {
    filtered = filtered.filter((o) => riskLevels.includes(o.riskLevel));
  }
  const sources = normalizeList(source);
  if (sources && sources.length > 0) {
    filtered = filtered.filter((o) => sources.includes(o.source));
  }
  if (typeof attempts === 'number') {
    filtered = filtered.filter((o) => (o.deliveryAttempts ?? 0) === attempts);
  }
  if (hasCarrier === true) {
    filtered = filtered.filter((o) => Boolean(o.carrier));
  }
  if (hasCarrier === false) {
    filtered = filtered.filter((o) => !o.carrier);
  }
  return sortOrders(filtered, sort);
};

const getOrders = async ({
  page = 1,
  pageSize = 20,
  search,
  status,
  carrier,
  wilaya,
  dateFrom,
  dateTo,
  codMin,
  codMax,
  riskLevel,
  source,
  attempts,
  hasCarrier,
  sort,
  customerId,
} = {}) => {
  if (env.useMock) {
    const all = mockOrders().map(enrichOrder);
    const filtered = filterOrders(all, {
      status,
      carrier,
      wilaya,
      search,
      dateFrom,
      dateTo,
      codMin,
      codMax,
      riskLevel,
      source,
      attempts,
      hasCarrier,
      sort,
      customerId,
    });
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return { data, meta: { total, page, pageSize } };
  }

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (status) params.set('status', status);
  if (carrier) params.set('carrier', carrier);
  if (wilaya) params.set('wilaya', wilaya);
  if (search) params.set('search', search);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  if (typeof codMin === 'number') params.set('codMin', String(codMin));
  if (typeof codMax === 'number') params.set('codMax', String(codMax));
  if (riskLevel) params.set('riskLevel', Array.isArray(riskLevel) ? riskLevel.join(',') : riskLevel);
  if (source) params.set('source', Array.isArray(source) ? source.join(',') : source);
  if (typeof attempts === 'number') params.set('attempts', String(attempts));
  if (typeof hasCarrier === 'boolean') params.set('hasCarrier', String(hasCarrier));

  const res = await fetch(`${env.engineAUrl}/oms/orders?${params.toString()}`);
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const getOrderById = async (id) => {
  if (env.useMock) {
    const order = mockOrders().find((o) => o.id === id);
    return order ? enrichOrder(order) : null;
  }
  const res = await fetch(`${env.engineAUrl}/oms/orders/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const getStats = async () => {
  if (env.useMock) return computeStats(mockOrders());
  const res = await fetch(`${env.engineAUrl}/oms/stats`);
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const getQueue = async () => {
  if (env.useMock) return computeQueue(mockOrders().map(enrichOrder));
  const res = await fetch(`${env.engineAUrl}/oms/queue`);
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const getCarrierSuivi = async () => {
  if (env.useMock) return computeCarrierSuivi(mockOrders());
  const res = await fetch(`${env.engineAUrl}/oms/carrier-suivi`);
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const getAnalytics = async (period = '7d') => {
  if (env.useMock) return computeAnalytics(mockOrders(), period);
  const res = await fetch(`${env.engineAUrl}/oms/analytics?period=${encodeURIComponent(period)}`);
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const confirmOrder = async (id, userId) => {
  if (env.useMock) {
    const order = mockOrders().find((o) => o.id === id);
    if (!order) return null;
    const prevStatus = order.status;
    order.status = 'Confirmed';
    order.confirmedBy = userId ?? 'Mock Operator';
    order.updatedAt = new Date().toISOString();
    order.history = order.history ?? [];
    order.history.push({
      at: order.updatedAt,
      from: prevStatus,
      to: 'Confirmed',
      by: order.confirmedBy,
      role: 'OMS_OPERATOR',
      reason: null,
    });
    return enrichOrder(order);
  }

  const res = await fetch(`${env.engineAUrl}/oms/orders/${id}/confirm`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmedBy: userId }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const cancelOrder = async (id, reason, userId) => {
  if (env.useMock) {
    const order = mockOrders().find((o) => o.id === id);
    if (!order) return null;
    const prevStatus = order.status;
    order.status = 'Cancelled';
    order.cancelReason = reason;
    order.updatedAt = new Date().toISOString();
    order.history = order.history ?? [];
    order.history.push({
      at: order.updatedAt,
      from: prevStatus,
      to: 'Cancelled',
      by: userId ?? 'Mock Operator',
      role: 'OMS_OPERATOR',
      reason,
    });
    return enrichOrder(order);
  }

  const res = await fetch(`${env.engineAUrl}/oms/orders/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, cancelledBy: userId }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const assignCarrier = async (id, carrier, userId) => {
  if (env.useMock) {
    const order = mockOrders().find((o) => o.id === id);
    if (!order) return null;
    const prevStatus = order.status;
    order.carrier = carrier;
    order.trackingNumber = order.trackingNumber ?? `TRK-${carrier.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    order.tracking = order.tracking ?? { carrier: null, trackingNumber: null, events: [], attempts: [] };
    order.tracking.carrier = carrier;
    order.tracking.trackingNumber = order.trackingNumber;
    if (order.status === 'Confirmed') order.status = 'AwaitingPickup';
    order.updatedAt = new Date().toISOString();
    order.history = order.history ?? [];
    order.history.push({
      at: order.updatedAt,
      from: prevStatus,
      to: order.status,
      by: userId ?? 'Mock Operator',
      role: 'OMS_OPERATOR',
      reason: `Carrier assigne: ${carrier}`,
    });
    return enrichOrder(order);
  }

  const res = await fetch(`${env.engineAUrl}/oms/orders/${id}/assign-carrier`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carrier, assignedBy: userId }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const createOrder = async (payload) => {
  if (env.useMock) {
    const orders = mockOrders();
    const seq = nextOrderSequence(orders);
    const now = new Date();
    const year = now.getUTCFullYear();
    const id = `ord-${year}-${padSeq(seq)}`;
    const reference = `ORD-${year}-${padSeq(seq)}`;

    const products = pimProducts();
    const items = (payload.items ?? []).map((it) => {
      const product = products.find((p) => p.sku === it.sku) ?? {};
      const qty = it.quantity ?? it.qty ?? 1;
      const unitPriceTTC = product.priceTTC ?? it.priceTTC ?? 0;
      const total = unitPriceTTC * qty;
      return {
        productId: product.id ?? it.productId ?? it.sku ?? 'PRD-UNKNOWN',
        sku: it.sku,
        quantity: qty,
        qty,
        unitPriceHT: Math.round(unitPriceTTC / 1.19),
        unitPriceTTC,
        prixUnitTTC: unitPriceTTC,
        tvaRate: product.tvaRate ?? 'standard',
        total,
      };
    });

    // SYNC-3: Validate items are published in Catalogue before creating order
    const validation = validateOrderAgainstCatalogue(items);
    if (!validation.valid) {
      throw new AppError('CATALOGUE_VALIDATION', validation.errors[0].message, 400);
    }

    const totalTTC = items.reduce((s, it) => s + it.total, 0);
    const totalHT = Math.round(totalTTC / 1.19);
    const totalTVA = totalTTC - totalHT;

    const stockOk = true; // mock stock check
    const nextStatus = stockOk ? 'AwaitingValidation' : 'Draft';
    const autoCancelAt = stockOk
      ? new Date(Date.now() + 120 * 60 * 1000).toISOString()
      : null;

    // CRM customer lookup/upsert by phone — OMS must never create an order without a CRM identity.
    const customerPhone = payload.telephone ?? payload.customerPhone ?? '';
    const crmCustomers = require('../mocks/crm.mock');
    let crmMatch = customerPhone
      ? crmCustomers.find((c) => c.phone === customerPhone)
      : null;
    if (!crmMatch && customerPhone) {
      const nextCustSeq = crmCustomers.reduce((max, c) => {
        const m = (c.id || '').match(/CUST-(\d+)/);
        const n = m ? parseInt(m[1], 10) : 0;
        return Number.isFinite(n) ? Math.max(max, n) : max;
      }, 0) + 1;
      crmMatch = {
        id: `CUST-${String(nextCustSeq).padStart(3, '0')}`,
        phone: customerPhone,
        phoneSec: payload.telephone2 ?? null,
        nameFr: (payload.nomComplet ?? '').trim() || 'Client sans nom',
        nameAr: '',
        email: null,
        wilayaCode: payload.wilayaCode ?? '',
        commune: payload.commune ?? '',
        address: payload.adresse ?? payload.address ?? '',
        blacklisted: false,
        blacklistReason: null,
        blacklistMotif: null,
        blacklistedAt: null,
        blacklistedBy: null,
        preferredChannel: (payload.source ?? '').toLowerCase().includes('whats') ? 'whatsapp' : 'telephone',
        preferredLanguage: 'français',
        riskLevel: 'LOW',
        fraudScore: 0,
        lifecycleStatus: 'Nouveau client',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      crmCustomers.push(crmMatch);
    }
    const customerId = crmMatch?.id ?? payload.customerId ?? null;

    const order = {
      id,
      reference,
      status: nextStatus,
      customerId,
      customerPhone,
      wilayaCode: payload.wilayaCode ?? '',
      address: payload.adresse ?? payload.address ?? '',
      commune: payload.commune ?? '',
      source: payload.source ?? 'Saisie manuelle',
      noteInterne: payload.noteInterne ?? null,

      items,
      totalHT,
      totalTVA,
      totalTTC,
      codAmount: totalTTC,
      revenueRecognizedAt: null,

      carrier: null,
      trackingNumber: null,
      deliveryAttempts: 0,
      autoCancelAt,

      confirmedBy: null,
      cancelReason: null,

      history: stockOk
        ? [
          {
            at: now.toISOString(),
            from: 'Draft',
            to: 'AwaitingValidation',
            by: 'Systeme',
            role: 'system',
            reason: null,
          },
        ]
        : [],
      tracking: { carrier: null, trackingNumber: null, events: [], attempts: [] },
      paiement: {
        totalHT,
        totalTVA,
        totalTTC,
        codAmount: totalTTC,
        paymentStatus: 'En attente de confirmation',
        revenueRecognizedAt: null,
        carrierRemittance: null,
      },

      createdBy: payload.createdBy ?? 'usr-ops-001',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    orders.push(order);
    return enrichOrder(order);
  }

  const res = await fetch(`${env.engineAUrl}/oms/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

// SYNC-6: Transition to DeliveredCOD_Confirmed — deduct stock from Inventory.
const deliverOrder = async (id, userId) => {
  if (env.useMock) {
    const order = mockOrders().find((o) => o.id === id);
    if (!order) return null;
    const prevStatus = order.status;
    order.status = 'DeliveredCOD_Confirmed';
    order.updatedAt = new Date().toISOString();
    order.revenueRecognizedAt = order.updatedAt;
    if (order.paiement) {
      order.paiement.paymentStatus = 'Livre - revenu reconnu';
      order.paiement.revenueRecognizedAt = order.updatedAt;
    }
    order.history = order.history ?? [];
    order.history.push({
      at: order.updatedAt,
      from: prevStatus,
      to: 'DeliveredCOD_Confirmed',
      by: userId ?? 'Systeme',
      role: 'system',
      reason: 'Livraison confirmee — COD encaisse',
    });
    // RULE 3: deduct stock from Inventory
    deductStockForOrder(order);
    return enrichOrder(order);
  }

  const res = await fetch(`${env.engineAUrl}/oms/orders/${id}/deliver`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveredBy: userId }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

const handleReturnAction = async (id, action, payload = {}) => {
  if (env.useMock) {
    const orders = mockOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;
    const now = new Date().toISOString();
    const prevStatus = order.status;

    if (action === 'reintegrate') {
      order.returnOutcome = 'resalable';
      order.status = 'Returned';
      // SYNC-8: quarantine returned items (not directly back to available)
      quarantineStockForOrder(order);
    }

    if (action === 'declare_loss') {
      order.returnOutcome = 'destroyed';
      order.status = 'Returned';
      // SYNC-8: quarantine returned items even if declared as loss
      quarantineStockForOrder(order);
    }

    let newOrder = null;
    if (action === 'resend') {
      order.returnOutcome = 'resent';
      order.status = 'Returned';
      const enrichedOrder = enrichOrder(order);
      newOrder = await createOrder({
        nomComplet: enrichedOrder.customerNameFr,
        telephone: order.customerPhone,
        wilayaCode: order.wilayaCode,
        adresse: order.address,
        commune: order.commune,
        source: order.source,
        items: (payload.items ?? order.items ?? []).map((it) => ({
          sku: it.sku,
          quantity: it.quantity ?? it.qty ?? 1,
        })),
      });
    }

    order.updatedAt = now;
    order.history = order.history ?? [];
    order.history.push({
      at: now,
      from: prevStatus,
      to: order.status,
      by: 'Mock Operator',
      role: 'OMS_OPERATOR',
      reason: `Return action: ${action}`,
    });

    return { order: enrichOrder(order), newOrder };
  }

  const res = await fetch(`${env.engineAUrl}/oms/orders/${id}/return-action`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return await res.json();
};

module.exports = {
  getOrders,
  getOrderById,
  getStats,
  getQueue,
  getCarrierSuivi,
  getAnalytics,
  createOrder,
  handleReturnAction,
  confirmOrder,
  cancelOrder,
  assignCarrier,
  deliverOrder,
};
