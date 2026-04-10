// OMS Adapter — LIVE data from oms-orders.mock (shared require() cache)
// Computes all OMS KPIs dynamically from the real orders array.

const env = require('../../../config/env');

const mockOrders = () => require('../../../mocks/oms-orders.mock');

// ─── Status constants (match oms-stats.service.js) ──────────────────────────

const DELIVERED_STATES  = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const CONFIRMED_STATES  = ['Confirmed', 'AwaitingPickup', 'HandedToCarrier', 'OutForDelivery', ...DELIVERED_STATES];
const FAIL_STATES       = ['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'];
const CANCELLED_STATES  = ['Cancelled'];
const TRANSIT_STATES    = ['HandedToCarrier', 'OutForDelivery'];
const CARRIERS          = ['Yalidine', 'Maystro', 'Ecotrack', 'Procolis'];

const WILAYA_LABELS = {
  '01': 'Adrar', '02': 'Chlef', '03': 'Laghouat', '04': 'Oum El Bouaghi',
  '05': 'Batna', '06': 'Béjaïa', '07': 'Biskra', '08': 'Béchar',
  '09': 'Blida', '10': 'Bouira', '13': 'Tlemcen', '14': 'Tiaret',
  '15': 'Tizi Ouzou', '16': 'Alger', '17': 'Djelfa', '18': 'Jijel',
  '19': 'Sétif', '20': 'Saïda', '21': 'Skikda', '22': 'Sidi Bel Abbès',
  '23': 'Annaba', '24': 'Guelma', '25': 'Constantine', '26': 'Médéa',
  '27': 'Mostaganem', '28': 'M\'Sila', '29': 'Mascara', '30': 'Ouargla',
  '31': 'Oran', '34': 'Bordj Bou Arréridj', '35': 'Boumerdès',
  '36': 'El Tarf', '38': 'Tissemsilt', '39': 'El Oued', '42': 'Tipaza',
  '43': 'Mila', '44': 'Aïn Defla', '46': 'Aïn Témouchent',
  '47': 'Ghardaïa', '48': 'Relizane',
};

const CANCEL_REASONS = [
  'Expiré automatiquement',
  'Échec livraison – absent',
  'Client refuse COD',
  'Doublon',
  'Injoignable',
  'Adresse incorrecte',
  'Rupture stock',
];

const SOURCE_CHANNELS = ['Site Web', 'WhatsApp', 'Téléphone', 'Instagram'];

// ─── Period helpers ─────────────────────────────────────────────────────────

const PERIOD_DAYS = { today: 1, '7d': 7, '30d': 30, quarter: 90, year: 365 };

function resolvePeriod(period) {
  if (period && typeof period === 'object' && period.from) {
    return { from: new Date(period.from), to: period.to ? new Date(period.to) : new Date() };
  }
  const days = PERIOD_DAYS[period] || 30;
  const to   = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  return { from, to };
}

function filterByPeriod(orders, period) {
  const { from, to } = resolvePeriod(period);
  return orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= from && d <= to;
  });
}

function previousPeriod(period) {
  const { from, to } = resolvePeriod(period);
  const duration = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - duration), to: new Date(from.getTime()) };
}

// ─── Computation helpers ────────────────────────────────────────────────────

function dayKey(d) { return new Date(d).toISOString().slice(0, 10); }

function hourKey(d) { return new Date(d).getHours(); }

function pct(a, b) { return b > 0 ? Math.round((a / b) * 10000) / 100 : 0; }

function delta(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ─── Main adapter function ──────────────────────────────────────────────────

async function getOmsOverview(period = '30d', comparison = false) {
  const allOrders = mockOrders();
  const orders    = filterByPeriod(allOrders, period);

  // ── Core counts ──
  const totalOrders    = orders.length;
  const delivered      = orders.filter((o) => DELIVERED_STATES.includes(o.status));
  const confirmed      = orders.filter((o) => CONFIRMED_STATES.includes(o.status));
  const failed         = orders.filter((o) => FAIL_STATES.includes(o.status));
  const cancelled      = orders.filter((o) => CANCELLED_STATES.includes(o.status));
  const returned       = orders.filter((o) => o.status === 'Returned');
  const inTransit      = orders.filter((o) => TRANSIT_STATES.includes(o.status));
  const awaiting       = orders.filter((o) => o.status === 'AwaitingValidation');

  // ── Financial ──
  const totalCA = delivered.reduce((s, o) => s + (o.totalTTC || 0), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalCA / delivered.length || 0) : 0;

  // ── Rates ──
  const tauxLivraison    = pct(delivered.length, delivered.length + failed.length);
  const tauxConfirmation = pct(confirmed.length, totalOrders);
  const tauxEchec        = pct(failed.length, totalOrders);
  const tauxAnnulation   = pct(cancelled.length, totalOrders);
  const tauxRetour       = pct(returned.length, totalOrders);
  const codCollectionRate = pct(
    orders.filter((o) => o.status === 'COD_Remitted').length,
    delivered.length,
  );

  // ── Funnel ──
  const funnelData = {
    recues:      totalOrders,
    confirmees:  confirmed.length,
    expediees:   inTransit.length + delivered.length,
    livrees:     delivered.length,
    echecs:      failed.length,
  };

  // ── CA by day ──
  const caByDay = [];
  const dayMap = {};
  orders.forEach((o) => {
    const dk = dayKey(o.createdAt);
    if (!dayMap[dk]) dayMap[dk] = { date: dk, ca: 0, count: 0, livrees: 0, confirmees: 0 };
    dayMap[dk].count++;
    if (DELIVERED_STATES.includes(o.status)) {
      dayMap[dk].ca += o.totalTTC || 0;
      dayMap[dk].livrees++;
    }
    if (CONFIRMED_STATES.includes(o.status)) dayMap[dk].confirmees++;
  });
  Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date)).forEach((d) => caByDay.push(d));

  const maxDay = caByDay.reduce((mx, d) => (d.count > (mx?.count || 0) ? d : mx), caByDay[0] || null);
  const minDay = caByDay.reduce((mn, d) => (d.count < (mn?.count || Infinity) ? d : mn), caByDay[0] || null);

  // ── Volume by hour ──
  const volumeByHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  orders.forEach((o) => { volumeByHour[hourKey(o.createdAt)].count++; });

  // ── Status distribution ──
  const statusMap = {};
  orders.forEach((o) => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
  const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // ── Operator performance ──
  const opMap = {};
  orders.forEach((o) => {
    const op = o.confirmedBy || 'Non assigné';
    if (!opMap[op]) opMap[op] = { name: op, total: 0, confirmed: 0 };
    opMap[op].total++;
    if (CONFIRMED_STATES.includes(o.status)) opMap[op].confirmed++;
  });
  const operatorPerformance = Object.values(opMap).map((op) => ({
    name: op.name,
    appelees: op.total,
    confirmees: op.confirmed,
    tauxConfirmation: pct(op.confirmed, op.total),
  }));
  const teamAvgTauxConfirmation = operatorPerformance.length > 0
    ? Math.round(operatorPerformance.reduce((s, o) => s + o.tauxConfirmation, 0) / operatorPerformance.length * 100) / 100
    : 0;

  // ── Carrier performance ──
  const carrierMap = {};
  CARRIERS.forEach((c) => { carrierMap[c] = { name: c, total: 0, delivered: 0, failed: 0, delais: [], wilayas: new Set() }; });
  orders.forEach((o) => {
    if (!o.carrier || !carrierMap[o.carrier]) return;
    const cm = carrierMap[o.carrier];
    cm.total++;
    if (DELIVERED_STATES.includes(o.status)) {
      cm.delivered++;
      const d = (new Date(o.updatedAt) - new Date(o.createdAt)) / 86400000;
      cm.delais.push(Math.max(1, Math.round(d)));
    }
    if (FAIL_STATES.includes(o.status)) cm.failed++;
    if (o.wilayaCode) cm.wilayas.add(o.wilayaCode);
  });
  const carrierPerformance = CARRIERS.map((name) => {
    const cm = carrierMap[name];
    return {
      name,
      total:          cm.total,
      delivered:      cm.delivered,
      failed:         cm.failed,
      tauxLivraison:  pct(cm.delivered, cm.delivered + cm.failed),
      delaiMoyen:     cm.delais.length > 0 ? Math.round(cm.delais.reduce((a, b) => a + b, 0) / cm.delais.length) : null,
      wilayas:        cm.wilayas.size,
    };
  });

  // ── Failure reasons ──
  const reasonMap = {};
  orders.filter((o) => CANCELLED_STATES.includes(o.status) || FAIL_STATES.includes(o.status)).forEach((o) => {
    const r = o.cancelReason || (FAIL_STATES.includes(o.status) ? 'Échec livraison – absent' : 'Autre');
    reasonMap[r] = (reasonMap[r] || 0) + 1;
  });
  const REASON_COLORS = ['#C62828', '#FF8A00', '#F9A825', '#0D47A1', '#4A148C', '#2E7D32', '#757575'];
  const failureReasons = Object.entries(reasonMap)
    .sort((a, b) => b[1] - a[1])
    .map(([raison, count], i) => ({ raison, count, color: REASON_COLORS[i % REASON_COLORS.length] }));

  // ── Montant distribution (histogram) ──
  const ranges = [
    { label: '0–2k', min: 0, max: 2000 },
    { label: '2k–5k', min: 2000, max: 5000 },
    { label: '5k–10k', min: 5000, max: 10000 },
    { label: '10k–20k', min: 10000, max: 20000 },
    { label: '20k–50k', min: 20000, max: 50000 },
    { label: '50k+', min: 50000, max: Infinity },
  ];
  const montantDistribution = ranges.map((r) => ({
    label: r.label,
    count: orders.filter((o) => (o.totalTTC || 0) >= r.min && (o.totalTTC || 0) < r.max).length,
  }));
  const panierMoyen = totalOrders > 0 ? Math.round(orders.reduce((s, o) => s + (o.totalTTC || 0), 0) / totalOrders) : 0;

  // ── Source channel distribution ──
  const sourceMap = {};
  orders.forEach((o) => { const s = o.source || 'Autre'; sourceMap[s] = (sourceMap[s] || 0) + 1; });
  const sourceDistribution = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));

  // ── Top products by CA ──
  const prodMap = {};
  orders.forEach((o) => {
    if (!DELIVERED_STATES.includes(o.status)) return;
    (o.items || []).forEach((item) => {
      const key = item.sku || item.productId;
      if (!prodMap[key]) prodMap[key] = { sku: key, nameFr: item.nameFr, ca: 0, qty: 0 };
      prodMap[key].ca  += (item.unitPriceTTC || 0) * (item.quantity || 0);
      prodMap[key].qty += item.quantity || 0;
    });
  });
  const topProductsCA = Object.values(prodMap).sort((a, b) => b.ca - a.ca).slice(0, 10);

  // ── CA by wilaya ──
  const wilayaMap = {};
  orders.forEach((o) => {
    const wc = o.wilayaCode;
    if (!wc) return;
    if (!wilayaMap[wc]) wilayaMap[wc] = { code: wc, name: WILAYA_LABELS[wc] || wc, ca: 0, count: 0, delivered: 0, failed: 0 };
    wilayaMap[wc].count++;
    if (DELIVERED_STATES.includes(o.status)) {
      wilayaMap[wc].ca += o.totalTTC || 0;
      wilayaMap[wc].delivered++;
    }
    if (FAIL_STATES.includes(o.status)) wilayaMap[wc].failed++;
  });
  const caByWilaya = Object.values(wilayaMap)
    .map((w) => ({ ...w, tauxLivraison: pct(w.delivered, w.delivered + w.failed) }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 10);

  // ── Cancelled breakdown ──
  const annulesAuto   = cancelled.filter((o) => (o.cancelReason || '').toLowerCase().includes('expir')).length;
  const annulesManuel = cancelled.length - annulesAuto;

  // ── Comparison with previous period ──
  let comp = null;
  if (comparison) {
    const prev = previousPeriod(period);
    const prevOrders   = allOrders.filter((o) => { const d = new Date(o.createdAt); return d >= prev.from && d <= prev.to; });
    const prevDelivered = prevOrders.filter((o) => DELIVERED_STATES.includes(o.status));
    const prevFailed    = prevOrders.filter((o) => FAIL_STATES.includes(o.status));
    const prevCA        = prevDelivered.reduce((s, o) => s + (o.totalTTC || 0), 0);
    comp = {
      deltaCA:          delta(totalCA, prevCA),
      deltaOrders:      delta(totalOrders, prevOrders.length),
      deltaLivraison:   delta(tauxLivraison, pct(prevDelivered.length, prevDelivered.length + prevFailed.length)),
    };
  }

  return {
    totalCA,
    totalOrders,
    confirmedCount:  confirmed.length,
    deliveredCount:  delivered.length,
    failedCount:     failed.length,
    cancelledCount:  cancelled.length,
    returnedCount:   returned.length,
    inTransitCount:  inTransit.length,
    awaitingCount:   awaiting.length,
    avgOrderValue,
    panierMoyen,
    tauxLivraison,
    tauxConfirmation,
    tauxEchec,
    tauxAnnulation,
    tauxRetour,
    codCollectionRate,
    annulesAuto,
    annulesManuel,
    funnelData,
    caByDay,
    maxDay,
    minDay,
    volumeByHour:    volumeByHour.filter((h) => h.hour >= 8 && h.hour <= 22),
    statusDistribution,
    operatorPerformance,
    teamAvgTauxConfirmation,
    carrierPerformance,
    failureReasons,
    montantDistribution,
    sourceDistribution,
    topProductsCA,
    caByWilaya,
    comparison:      comp,
  };
}

module.exports = { getOmsOverview };
