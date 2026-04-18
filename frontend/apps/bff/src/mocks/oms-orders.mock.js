const OPERATORS = require('./oms-operators.mock');
const CRM_CUSTOMERS = require('./crm.mock');

// ─── ITEM_CATALOG — PIM-valid products ONLY ───────────────────────────────
// Every SKU maps to a real PIM product (pim.mock.js PRD-001..PRD-006) or one
// of their variants. Prices are "captured at order time" snapshots.
const ITEM_CATALOG = [
  // PRD-001 + variants
  { sku: 'SKU-0042-BLK',     productId: 'PRD-001', priceTTC: 1200 },
  { sku: 'SKU-0042-NVY',     productId: 'PRD-001', priceTTC: 1200 },
  { sku: 'SKU-0042-CLR',     productId: 'PRD-001', priceTTC: 1200 },
  // PRD-002 + variants
  { sku: 'SKU-0118-WR',      productId: 'PRD-002', priceTTC: 8500 },
  { sku: 'SKU-0118-WR-41',   productId: 'PRD-002', priceTTC: 8500 },
  { sku: 'SKU-0118-WR-42',   productId: 'PRD-002', priceTTC: 8500 },
  { sku: 'SKU-0118-WR-43',   productId: 'PRD-002', priceTTC: 8500 },
  { sku: 'SKU-0118-WR-44',   productId: 'PRD-002', priceTTC: 8500 },
  { sku: 'SKU-0118-WR-45',   productId: 'PRD-002', priceTTC: 8500 },
  // PRD-003 + variants
  { sku: 'SKU-0234-FLR',     productId: 'PRD-003', priceTTC: 3200 },
  { sku: 'SKU-0234-FLR-SM',  productId: 'PRD-003', priceTTC: 3200 },
  { sku: 'SKU-0234-FLR-ML',  productId: 'PRD-003', priceTTC: 3200 },
  { sku: 'SKU-0234-FLR-XL',  productId: 'PRD-003', priceTTC: 3200 },
  // PRD-005 + variants
  { sku: 'SKU-0301-BK46',    productId: 'PRD-005', priceTTC: 12900 },
  { sku: 'SKU-0301-BK40',    productId: 'PRD-005', priceTTC: 12900 },
  { sku: 'SKU-0301-BK41',    productId: 'PRD-005', priceTTC: 12900 },
  // PRD-006
  { sku: 'SKU-0789-RAM',     productId: 'PRD-006', priceTTC: 5900 },
];
// Note: PRD-004 (SKU-DRAFT-001) is deliberately excluded — it is status=draft
// in PIM and not published in Catalogue, so it cannot appear in orders.

// ─── 108 orders across 13 statuses — spread over today / 7d / 30d ─────────
// Counts are tuned so analytics dashboards always have non-zero values on
// every common period (today, last 7 days, last 30 days).
const STATUS_PLAN = [
  { status: 'AwaitingValidation',      count: 16 },  // 0-2 days (feeds today+7d)
  { status: 'Confirmed',               count: 10 },  // 1-4 days (feeds 7d)
  { status: 'AwaitingPickup',          count: 7 },   // 2-5 days (feeds 7d)
  { status: 'HandedToCarrier',         count: 9 },   // 3-8 days
  { status: 'OutForDelivery',          count: 8 },   // 3-8 days
  { status: 'DeliveredCOD_Confirmed',  count: 18 },  // 3-40 days (bulk of CA)
  { status: 'COD_Remitted',            count: 10 },  // 3-40 days
  { status: 'DeliveryFailed_Absent',   count: 6 },   // 5-30 days
  { status: 'ReturnInTransit_Refused', count: 3 },
  { status: 'LostInTransit',           count: 2 },
  { status: 'Returned',               count: 5 },
  { status: 'Cancelled',              count: 10 },  // 1-35 days
  { status: 'Draft',                   count: 4 },   // today only
];
const TOTAL_ORDERS = STATUS_PLAN.reduce((s, p) => s + p.count, 0); // 108

// Customer mapping: 108 orders → 15 customers.
// CUST-001 = VIP → gets delivered/COD orders.
// CUST-008 (HIGH risk) → gets some failures.
// CUST-013/015 (blacklisted) → gets cancelled/failed orders.
const ORDER_CUSTOMER_MAP = [
  /* 0-15  AwaitingValidation (16) */ 'CUST-002','CUST-003','CUST-004','CUST-005','CUST-006','CUST-007','CUST-009','CUST-010','CUST-011','CUST-001','CUST-014','CUST-012','CUST-001','CUST-002','CUST-005','CUST-006',
  /* 16-25 Confirmed (10)          */ 'CUST-001','CUST-001','CUST-002','CUST-003','CUST-004','CUST-005','CUST-006','CUST-007','CUST-009','CUST-010',
  /* 26-32 AwaitingPickup (7)      */ 'CUST-009','CUST-010','CUST-011','CUST-001','CUST-002','CUST-003','CUST-005',
  /* 33-41 HandedToCarrier (9)     */ 'CUST-004','CUST-005','CUST-006','CUST-007','CUST-009','CUST-010','CUST-011','CUST-012','CUST-001',
  /* 42-49 OutForDelivery (8)      */ 'CUST-001','CUST-002','CUST-003','CUST-004','CUST-005','CUST-006','CUST-007','CUST-009',
  /* 50-67 DeliveredCOD_Conf (18)  */ 'CUST-001','CUST-001','CUST-001','CUST-001','CUST-002','CUST-002','CUST-003','CUST-005','CUST-006','CUST-007','CUST-009','CUST-010','CUST-011','CUST-012','CUST-004','CUST-001','CUST-002','CUST-006',
  /* 68-77 COD_Remitted (10)       */ 'CUST-001','CUST-001','CUST-001','CUST-002','CUST-003','CUST-005','CUST-006','CUST-009','CUST-001','CUST-007',
  /* 78-83 DeliveryFailed (6)      */ 'CUST-008','CUST-013','CUST-014','CUST-004','CUST-010','CUST-008',
  /* 84-86 ReturnInTransit (3)     */ 'CUST-013','CUST-015','CUST-008',
  /* 87-88 LostInTransit (2)       */ 'CUST-012','CUST-014',
  /* 89-93 Returned (5)            */ 'CUST-003','CUST-008','CUST-013','CUST-015','CUST-014',
  /* 94-103 Cancelled (10)         */ 'CUST-013','CUST-015','CUST-008','CUST-009','CUST-010','CUST-011','CUST-014','CUST-004','CUST-002','CUST-003',
  /* 104-107 Draft (4)             */ 'CUST-002','CUST-015','CUST-007','CUST-001',
];

// ─── Date strategy ─────────────────────────────────────────────────────────
// Anchor to NOW so analytics always cover current period.
// Orders spread across 45 days. Recent statuses (Draft, AwaitingValidation)
// get dates in the last 3 days. Older terminal states (Delivered, Cancelled,
// Returned) get dates spread across the full range.
const NOW = new Date();
const CARRIERS = ['Yalidine', 'Maystro', 'Ecotrack', 'Procolis'];
const SOURCE_CHANNELS = ['Saisie manuelle', 'Instagram', 'Facebook', 'WhatsApp', 'Appel telephonique'];
const CANCEL_REASONS = ['Expire (timer)', 'Client refuse', 'Adresse incorrecte', 'Doublon commande', 'Stock absent'];

const WILAYAS = [
  { code: '16', name: 'Alger', commune: 'Alger Centre', address: '12 Rue Didouche Mourad' },
  { code: '31', name: 'Oran', commune: 'Oran Centre', address: '7 Boulevard Millenium' },
  { code: '25', name: 'Constantine', commune: 'Constantine Centre', address: '3 Rue Larbi Ben Mhidi' },
  { code: '19', name: 'Setif', commune: 'Setif Centre', address: '18 Avenue du 8 Mai 1945' },
  { code: '23', name: 'Annaba', commune: 'Annaba Centre', address: '2 Rue Boukhadra' },
  { code: '06', name: 'Bejaia', commune: 'Bejaia Centre', address: '10 Rue des Freres Bouadou' },
  { code: '09', name: 'Blida', commune: 'Blida Centre', address: '55 Cite El Moudjahid' },
  { code: '05', name: 'Batna', commune: 'Batna Centre', address: '3 Rue Ibn Khaldoun' },
  { code: '13', name: 'Tlemcen', commune: 'Tlemcen Centre', address: '4 Rue Emir Abdelkader' },
  { code: '15', name: 'Tizi Ouzou', commune: 'Tizi Ouzou Centre', address: '5 Boulevard Zighoud Youcef' },
  { code: '35', name: 'Boumerdes', commune: 'Boumerdes Centre', address: "17 Boulevard de l'ALN" },
  { code: '08', name: 'Bechar', commune: 'Bechar Centre', address: '21 Rue du 1er Novembre' },
  { code: '29', name: 'Mascara', commune: 'Mascara Centre', address: '4 Rue Larbi Ben Mhidi' },
  { code: '41', name: 'Souk Ahras', commune: 'Souk Ahras Centre', address: '9 Cite El Houria' },
  { code: '43', name: 'Mila', commune: 'Mila Centre', address: '30 Rue Emir Abdelkader' },
  { code: '02', name: 'Chlef', commune: 'Chlef Centre', address: '14 Cite Bab El Oued' },
  { code: '18', name: 'Jijel', commune: 'Jijel Centre', address: '6 Cite OPGI' },
  { code: '28', name: "M'sila", commune: "M'sila Centre", address: '11 Rue des Martyrs' },
  { code: '07', name: 'Biskra', commune: 'Biskra Centre', address: '1 Rue des Palmiers' },
  { code: '10', name: 'Bouira', commune: 'Bouira Centre', address: '22 Rue du 5 Juillet' },
];

const pad = (n, len = 5) => String(n).padStart(len, '0');
const addHours = (d, h) => new Date(d.getTime() + h * 60 * 60 * 1000);
const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

function pick(list, idx) {
  return list[idx % list.length];
}

// Weighted carrier pick — realistic market share, breaks round-robin alignment
// with status buckets that are all multiples of 4. Deterministic per idx.
const CARRIER_SHARES = [
  { name: 'Yalidine', weight: 40 },
  { name: 'Maystro',  weight: 25 },
  { name: 'Ecotrack', weight: 23 },
  { name: 'Procolis', weight: 12 },
];
function pickCarrier(idx) {
  const r = (idx * 37 + 11) % 100;
  let acc = 0;
  for (const c of CARRIER_SHARES) {
    acc += c.weight;
    if (r < acc) return c.name;
  }
  return CARRIER_SHARES[CARRIER_SHARES.length - 1].name;
}

/**
 * Compute createdAt for a given order index.
 * Strategy: distribute orders across 45 days ending today.
 * Recent statuses (Draft, AwaitingValidation) → last 0-2 days.
 * Active pipeline (Confirmed..OutForDelivery) → last 1-10 days.
 * Terminal states → spread across 3-45 days ago.
 */
function computeCreatedAt(globalIdx, status) {
  // Hash-based distribution within the status group ensures no clustering
  const hashOffset = ((globalIdx * 7) + (globalIdx * 13) % 37) % 100;

  if (status === 'Draft') {
    // Created in last few hours
    return addHours(NOW, -(hashOffset % 12));
  }
  if (status === 'AwaitingValidation') {
    // Created in last 0-2 days (recent)
    const hoursAgo = (hashOffset % 48);
    return addHours(NOW, -hoursAgo);
  }
  if (status === 'Confirmed') {
    // Created 1-4 days ago
    const daysAgo = 1 + (hashOffset % 4);
    return addDays(NOW, -daysAgo);
  }
  if (status === 'AwaitingPickup') {
    // Created 2-5 days ago
    const daysAgo = 2 + (hashOffset % 4);
    return addDays(NOW, -daysAgo);
  }
  if (status === 'HandedToCarrier' || status === 'OutForDelivery') {
    // Created 3-8 days ago
    const daysAgo = 3 + (hashOffset % 6);
    return addDays(NOW, -daysAgo);
  }
  if (status === 'DeliveredCOD_Confirmed' || status === 'COD_Remitted') {
    // Spread across 3-40 days ago (covers full analytics range)
    const daysAgo = 3 + Math.floor(hashOffset * 37 / 100);
    return addDays(NOW, -daysAgo);
  }
  if (['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'].includes(status)) {
    // Failures: 5-30 days ago
    const daysAgo = 5 + Math.floor(hashOffset * 25 / 100);
    return addDays(NOW, -daysAgo);
  }
  if (status === 'Cancelled') {
    // Cancelled: spread 1-35 days ago
    const daysAgo = 1 + Math.floor(hashOffset * 34 / 100);
    return addDays(NOW, -daysAgo);
  }
  // Fallback
  return addDays(NOW, -(hashOffset % 30));
}

function makeItems(seed) {
  const count = 1 + (seed % 3);
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const item = pick(ITEM_CATALOG, seed + i);
    const qty = 1 + ((seed + i) % 3);
    const total = item.priceTTC * qty;
    items.push({
      productId: item.productId,
      sku: item.sku,
      quantity: qty,
      qty,
      unitPriceHT: Math.round(item.priceTTC / 1.19),
      unitPriceTTC: item.priceTTC,
      prixUnitTTC: item.priceTTC,
      tvaRate: 'standard',
      total,
    });
  }
  return items;
}

function computeTotals(items) {
  const totalTTC = items.reduce((s, it) => s + it.total, 0);
  const totalHT = Math.round(totalTTC / 1.19);
  const totalTVA = totalTTC - totalHT;
  return { totalTTC, totalHT, totalTVA };
}

function statusNeedsCarrier(status) {
  return [
    'AwaitingPickup',
    'HandedToCarrier',
    'OutForDelivery',
    'DeliveredCOD_Confirmed',
    'COD_Remitted',
    'DeliveryFailed_Absent',
    'ReturnInTransit_Refused',
    'LostInTransit',
    'Returned',
  ].includes(status);
}

function statusLabel(status, carrier) {
  switch (status) {
    case 'HandedToCarrier':
      return `Pris en charge par ${carrier}`;
    case 'OutForDelivery':
      return 'En cours de livraison';
    case 'DeliveredCOD_Confirmed':
      return 'Livre - COD encaisse';
    case 'COD_Remitted':
      return 'COD remis';
    case 'DeliveryFailed_Absent':
      return 'Client absent';
    case 'ReturnInTransit_Refused':
      return 'Retour en transit';
    case 'LostInTransit':
      return 'Perdu en transit';
    case 'Returned':
      return 'Retourne au depot';
    case 'AwaitingPickup':
      return 'En attente de ramassage';
    default:
      return status;
  }
}

function buildTracking(status, carrier, trackingNumber, createdAt, attemptCount) {
  if (!carrier) {
    return { carrier: null, trackingNumber: null, events: [], attempts: [] };
  }

  const events = [];
  const firstAt = addHours(createdAt, 6);
  events.push({
    date: firstAt.toISOString(),
    status: 'HandedToCarrier',
    label: statusLabel('HandedToCarrier', carrier),
  });

  if (status !== 'HandedToCarrier') {
    events.push({
      date: addHours(firstAt, 16).toISOString(),
      status,
      label: statusLabel(status, carrier),
    });
  }

  const attempts = [];
  if (attemptCount > 0) {
    for (let i = 1; i <= attemptCount; i += 1) {
      attempts.push({
        attemptNumber: i,
        date: addHours(firstAt, 20 + i * 10).toISOString(),
        result: i < attemptCount ? 'Absent' : 'En cours',
        note: i === attemptCount ? 'Derniere tentative' : 'Client absent',
      });
    }
  }

  return { carrier, trackingNumber, events, attempts };
}

function buildHistory(status, createdAt, updatedAt, confirmedBy, cancelReason) {
  const history = [
    {
      at: createdAt.toISOString(),
      from: 'Draft',
      to: 'AwaitingValidation',
      by: 'Systeme',
      role: 'system',
      reason: null,
    },
  ];

  if (status !== 'Draft' && status !== 'AwaitingValidation') {
    history.push({
      at: addHours(createdAt, 2).toISOString(),
      from: 'AwaitingValidation',
      to: 'Confirmed',
      by: confirmedBy || 'Mock Operator',
      role: 'OMS_OPERATOR',
      reason: null,
    });
  }

  if (status === 'Cancelled') {
    history.push({
      at: updatedAt.toISOString(),
      from: 'AwaitingValidation',
      to: 'Cancelled',
      by: confirmedBy || 'Mock Operator',
      role: 'OMS_OPERATOR',
      reason: cancelReason,
    });
    return history;
  }

  if (!['Draft', 'AwaitingValidation', 'Confirmed'].includes(status)) {
    history.push({
      at: updatedAt.toISOString(),
      from: 'Confirmed',
      to: status,
      by: 'Systeme',
      role: 'system',
      reason: null,
    });
  }

  return history;
}

function paymentStatusFrom(orderStatus) {
  if (['DeliveredCOD_Confirmed', 'COD_Remitted'].includes(orderStatus)) {
    return 'Livre - revenu reconnu';
  }
  if (['HandedToCarrier', 'OutForDelivery', 'AwaitingPickup'].includes(orderStatus)) {
    return 'En attente de livraison';
  }
  if (orderStatus === 'AwaitingValidation') return 'En attente de confirmation';
  if (orderStatus === 'Cancelled') return 'Annule';
  if (['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'].includes(orderStatus)) {
    return 'Retour en cours';
  }
  return 'En preparation';
}

function buildOrder(idx, status) {
  const seq = pad(idx + 1);
  const id = `ord-2026-${seq}`;
  const reference = `ORD-2026-${seq}`;
  const createdAt = computeCreatedAt(idx, status);
  const updatedAt = addHours(createdAt, 4 + (idx % 48));

  const customerId = ORDER_CUSTOMER_MAP[idx] || `CUST-${String((idx % 15) + 1).padStart(3, '0')}`;
  const crmCust = CRM_CUSTOMERS.find((c) => c.id === customerId) || CRM_CUSTOMERS[0];
  const wilaya = pick(WILAYAS, idx);
  const phone = crmCust.phone;

  const items = makeItems(idx);
  const totals = computeTotals(items);

  const carrier = statusNeedsCarrier(status) ? pickCarrier(idx) : null;
  const trackingNumber = carrier ? `TRK-${carrier.slice(0, 3).toUpperCase()}-${10000 + idx}` : null;

  const attemptCount =
    status === 'DeliveryFailed_Absent'
      ? 2 + (idx % 2)
      : status === 'ReturnInTransit_Refused'
      ? 2
      : status === 'LostInTransit'
      ? 3
      : status === 'Returned'
      ? 3
      : status === 'OutForDelivery'
      ? 1
      : 0;

  const confirmedBy =
    ['Confirmed', 'AwaitingPickup', 'HandedToCarrier', 'OutForDelivery', 'DeliveredCOD_Confirmed', 'COD_Remitted', 'DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned', 'Cancelled', 'AwaitingValidation']
      .includes(status)
      ? pick(OPERATORS, idx).name
      : null;

  const cancelReason = status === 'Cancelled' ? pick(CANCEL_REASONS, idx) : null;

  const autoCancelAt =
    status === 'AwaitingValidation'
      ? new Date(Date.now() + (5 + (idx % 120)) * 60 * 1000).toISOString()
      : null;

  const tracking = buildTracking(status, carrier, trackingNumber, createdAt, attemptCount);

  const paiement = {
    totalHT: totals.totalHT,
    totalTVA: totals.totalTVA,
    totalTTC: totals.totalTTC,
    codAmount: totals.totalTTC,
    paymentStatus: paymentStatusFrom(status),
    revenueRecognizedAt:
      ['DeliveredCOD_Confirmed', 'COD_Remitted'].includes(status)
        ? updatedAt.toISOString()
        : null,
    carrierRemittance:
      status === 'COD_Remitted'
        ? { status: 'Remis', expectedDate: addDays(updatedAt, 3).toISOString().slice(0, 10) }
        : status === 'DeliveredCOD_Confirmed'
        ? { status: 'En attente', expectedDate: addDays(updatedAt, 7).toISOString().slice(0, 10) }
        : null,
  };

  return {
    id,
    reference,
    customerId,
    status,
    customerPhone: phone,
    wilayaCode: wilaya.code,
    address: wilaya.address,
    commune: wilaya.commune,
    source: pick(SOURCE_CHANNELS, idx),
    noteInterne: idx % 6 === 0 ? 'Client regulier - suivre livraison' : null,

    items,
    totalHT: totals.totalHT,
    totalTVA: totals.totalTVA,
    totalTTC: totals.totalTTC,
    codAmount: totals.totalTTC,
    revenueRecognizedAt: paiement.revenueRecognizedAt,

    carrier,
    trackingNumber,
    deliveryAttempts: attemptCount,
    autoCancelAt,

    confirmedBy,
    cancelReason,

    history: buildHistory(status, createdAt, updatedAt, confirmedBy, cancelReason),
    tracking,
    paiement,

    createdBy: pick(OPERATORS, idx).id,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

const orders = [];
let idx = 0;
STATUS_PLAN.forEach((plan) => {
  for (let i = 0; i < plan.count; i += 1) {
    orders.push(buildOrder(idx, plan.status));
    idx += 1;
  }
});

module.exports = orders;
