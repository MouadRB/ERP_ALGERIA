// CRM Adapter — LIVE data from crm.mock + crm-tickets.mock + oms-orders.mock
// Computes all CRM KPIs dynamically using the same logic as customer.service.js.

const env = require('../../../config/env');

const mockCustomers = () => require('../../../mocks/crm.mock');
const mockTickets   = () => require('../../../mocks/crm-tickets.mock');
const mockOrders    = () => require('../../../mocks/oms-orders.mock');

// ─── Status constants (match customer.service.js) ───────────────────────────

const DELIVERED_STATUSES  = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const CANCELLED_STATUSES  = ['Cancelled'];
const RETURNED_STATUSES   = ['Returned', 'ReturnInTransit_Refused', 'LostInTransit'];

const WILAYA_LABELS = {
  '05': 'Batna', '06': 'Béjaïa', '09': 'Blida', '13': 'Tlemcen',
  '15': 'Tizi Ouzou', '16': 'Alger', '19': 'Sétif', '23': 'Annaba',
  '25': 'Constantine', '31': 'Oran', '35': 'Boumerdès', '42': 'Tipaza',
};

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

function pct(a, b) { return b > 0 ? Math.round((a / b) * 10000) / 100 : 0; }

function dayKey(d) { return new Date(d).toISOString().slice(0, 10); }

// ─── Customer metrics (same as customer.service.js) ─────────────────────────

function computeCustomerMetrics(customerId, allOrders) {
  const orders        = allOrders.filter((o) => o.customerId === customerId);
  const totalOrders   = orders.length;
  if (!totalOrders) return { totalOrders: 0, totalSpentTTC: 0, panierMoyen: null, tauxRetour: null, tauxAnnulation: null, lastOrderDate: null, deliveredCount: 0, cancelledCount: 0, returnedCount: 0 };

  const deliveredOrders = orders.filter((o) => DELIVERED_STATUSES.includes(o.status));
  const cancelledOrders = orders.filter((o) => CANCELLED_STATUSES.includes(o.status));
  const returnedOrders  = orders.filter((o) => RETURNED_STATUSES.includes(o.status));
  const totalSpentTTC   = deliveredOrders.reduce((s, o) => s + (o.totalTTC || 0), 0);
  const sortedByDate    = orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    totalOrders,
    totalSpentTTC,
    panierMoyen:     deliveredOrders.length > 0 ? Math.round(totalSpentTTC / deliveredOrders.length) : null,
    tauxRetour:      Math.round((returnedOrders.length / totalOrders) * 100),
    tauxAnnulation:  Math.round((cancelledOrders.length / totalOrders) * 100),
    lastOrderDate:   sortedByDate[0].createdAt,
    deliveredCount:  deliveredOrders.length,
    cancelledCount:  cancelledOrders.length,
    returnedCount:   returnedOrders.length,
  };
}

function computeSegment(customer, metrics) {
  if (customer.blacklisted) return 'Liste noire';
  if (!metrics.totalOrders) return 'Nouveau';
  if ((customer.fraudScore !== null && customer.fraudScore > 60) || metrics.tauxAnnulation > 50) return 'A risque';
  if (metrics.lastOrderDate) {
    const daysSince = (Date.now() - new Date(metrics.lastOrderDate).getTime()) / 86400000;
    if (daysSince > 90) return 'Inactif';
  }
  if (metrics.totalOrders >= 8 && metrics.tauxAnnulation < 20 && (metrics.tauxRetour === null || metrics.tauxRetour < 15)) return 'VIP';
  if (metrics.totalOrders >= 3) return 'Fidèle';
  return 'Nouveau';
}

// ─── Main adapter function ──────────────────────────────────────────────────

async function getCrmOverview(period = '30d') {
  const customers = mockCustomers();
  const tickets   = mockTickets();
  const allOrders = mockOrders();

  // ── Enrich all customers ──
  const enriched = customers.map((c) => {
    const metrics = computeCustomerMetrics(c.id, allOrders);
    return { ...c, ...metrics, segment: computeSegment(c, metrics) };
  });

  // ── Segment distribution ──
  const segmentMap = {};
  enriched.forEach((c) => {
    segmentMap[c.segment] = (segmentMap[c.segment] || 0) + 1;
  });
  const segmentDistribution = Object.entries(segmentMap).map(([segment, count]) => ({ segment, count }));

  // ── Risk score distribution (histogram) ──
  const riskRanges = [
    { label: '0–20', min: 0, max: 20 },
    { label: '20–40', min: 20, max: 40 },
    { label: '40–60', min: 40, max: 60 },
    { label: '60–80', min: 60, max: 80 },
    { label: '80–100', min: 80, max: 101 },
  ];
  const riskScoreDistribution = riskRanges.map((r) => ({
    label: r.label,
    count: enriched.filter((c) => (c.fraudScore || 0) >= r.min && (c.fraudScore || 0) < r.max).length,
  }));
  const avgFraudScore = enriched.length > 0
    ? Math.round(enriched.reduce((s, c) => s + (c.fraudScore || 0), 0) / enriched.length)
    : 0;

  // ── Top clients by CA ──
  const topClientsByCA = enriched
    .filter((c) => c.totalSpentTTC > 0)
    .sort((a, b) => b.totalSpentTTC - a.totalSpentTTC)
    .slice(0, 10)
    .map((c) => ({ id: c.id, nameFr: c.nameFr, phone: c.phone, totalSpentTTC: c.totalSpentTTC, totalOrders: c.totalOrders, segment: c.segment }));

  // ── Clients by wilaya ──
  const wilayaMap = {};
  enriched.forEach((c) => {
    const wc = c.wilayaCode;
    if (!wilayaMap[wc]) wilayaMap[wc] = { code: wc, name: WILAYA_LABELS[wc] || wc, count: 0 };
    wilayaMap[wc].count++;
  });
  const clientsByWilaya = Object.values(wilayaMap).sort((a, b) => b.count - a.count);

  // ── Acquisition by day (customer creation dates) ──
  const { from, to } = resolvePeriod(period);
  const acquisitionMap = {};
  enriched.forEach((c) => {
    const cd = new Date(c.createdAt);
    if (cd >= from && cd <= to) {
      const dk = dayKey(c.createdAt);
      acquisitionMap[dk] = (acquisitionMap[dk] || 0) + 1;
    }
  });
  const acquisitionByDay = Object.entries(acquisitionMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const newThisMonth = acquisitionByDay.reduce((s, d) => s + d.count, 0);

  // ── Channel distribution (from OMS orders source) ──
  const channelMap = {};
  allOrders.forEach((o) => { const s = o.source || 'Autre'; channelMap[s] = (channelMap[s] || 0) + 1; });
  const channelDistribution = Object.entries(channelMap).map(([channel, count]) => ({ channel, count }));

  // ── Inactive clients (>90 days since last order) ──
  const inactiveClients = enriched
    .filter((c) => {
      if (!c.lastOrderDate) return c.totalOrders > 0;
      return (Date.now() - new Date(c.lastOrderDate).getTime()) / 86400000 > 90;
    })
    .map((c) => ({ id: c.id, nameFr: c.nameFr, phone: c.phone, lastOrderDate: c.lastOrderDate, totalSpentTTC: c.totalSpentTTC }));

  // ── Ticket / Support performance ──
  const openTickets     = tickets.filter((t) => t.status === 'Ouvert').length;
  const enCoursTickets  = tickets.filter((t) => t.status === 'En cours').length;
  const resolvedTickets = tickets.filter((t) => ['Résolu', 'Fermé'].includes(t.status)).length;
  const escalatedTickets = tickets.filter((t) => t.escalated === true).length;
  const totalTickets    = tickets.length;
  const tauxResolution  = pct(resolvedTickets, totalTickets);

  // Average resolution time (simplified: updatedAt - createdAt for resolved tickets)
  const resolvedList = tickets.filter((t) => ['Résolu', 'Fermé'].includes(t.status));
  const avgResolutionHours = resolvedList.length > 0
    ? Math.round(resolvedList.reduce((s, t) => s + (new Date(t.updatedAt) - new Date(t.createdAt)) / 3600000, 0) / resolvedList.length)
    : null;

  // Top ticket categories
  const catMap = {};
  tickets.forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + 1; });
  const topTicketCategories = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const supportPerformance = {
    totalTickets,
    openTickets,
    enCoursTickets,
    resolvedTickets,
    escalatedTickets,
    tauxResolution,
    avgResolutionHours,
    topCategories: topTicketCategories,
  };

  // ── Summary KPIs ──
  const totalCustomers = enriched.length;
  const activeCount    = enriched.filter((c) => c.totalOrders > 0 && c.segment !== 'Inactif').length;
  const vipCount       = enriched.filter((c) => c.segment === 'VIP').length;
  const blacklistedCount = enriched.filter((c) => c.blacklisted).length;
  const avgCA          = enriched.length > 0
    ? Math.round(enriched.reduce((s, c) => s + c.totalSpentTTC, 0) / enriched.length)
    : 0;

  return {
    totalCustomers,
    activeCount,
    vipCount,
    blacklistedCount,
    newThisMonth,
    avgCA,
    avgFraudScore,
    segmentDistribution,
    riskScoreDistribution,
    topClientsByCA,
    clientsByWilaya,
    acquisitionByDay,
    channelDistribution,
    inactiveClients,
    supportPerformance,
  };
}

module.exports = { getCrmOverview };
