// ─────────────────────────────────────────────────────────────────────────────
// Dashboard transformer — engine-b DTOs → BFF / frontend contract.
//
// engine-b's `/api/dashboard/*` endpoints return DTOs in PascalCase using
// French enum values for risk (`Faible` / `Moyen` / `Eleve`) and a structured
// `FunnelStep { Count, Percentage }` shape. The frontend contract (kept
// stable since the mock-era dashboard) uses camelCase, lowercase risk levels,
// and a flat funnel array `[{ state, count, percentage }, ...]`.
//
// All mappers are pure: no I/O, no time-of-day math. They run inside
// dashboard.service.js where the orchestrator collects the engine-b payload.
// ─────────────────────────────────────────────────────────────────────────────

const WILAYA_LABELS = {
  '16': 'Alger', '31': 'Oran', '25': 'Constantine', '19': 'Setif', '23': 'Annaba',
  '06': 'Bejaia', '09': 'Blida', '05': 'Batna', '13': 'Tlemcen', '15': 'Tizi Ouzou',
  '35': 'Boumerdes', '08': 'Bechar', '29': 'Mascara', '41': 'Souk Ahras', '43': 'Mila',
  '02': 'Chlef', '18': 'Jijel', '28': "M'sila", '07': 'Biskra', '10': 'Bouira',
};

const wilayaCode = (wilaya) => String(wilaya ?? '').padStart(2, '0');
const wilayaLabel = (wilaya) => WILAYA_LABELS[wilayaCode(wilaya)] ?? 'Inconnu';

const formatPhoneE164 = (phone) => {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('213')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+213 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
};

// engine-b emits "Faible" / "Moyen" / "Eleve". Frontend expects "low" /
// "medium" / "high" (matches the badge palette). Anything unexpected → "low".
const RISK_FR_TO_EN = { faible: 'low', moyen: 'medium', eleve: 'high' };
const RISK_EN_VALID = new Set(['low', 'medium', 'high']);
const normalizeRisk = (risk) => {
  const norm = String(risk ?? '').trim().toLowerCase();
  if (RISK_FR_TO_EN[norm]) return RISK_FR_TO_EN[norm];
  return RISK_EN_VALID.has(norm) ? norm : 'low';
};

// ─── KPI card block ─────────────────────────────────────────────────────────
const transformKpis = (k) => {
  if (!k) return null;
  const trendOrders   = Number(k.ordersVsYesterdayPct ?? k.OrdersVsYesterdayPct ?? 0);
  const deliveryRate  = Number(k.deliveryRatePct ?? k.DeliveryRatePct ?? 0);
  const weeklyTrend   = Number(k.deliveryRateWeekTrendPct ?? k.DeliveryRateWeekTrendPct ?? 0);
  return {
    ordersToday: {
      value:           Number(k.ordersToday ?? k.OrdersToday ?? 0),
      trendPct:        Math.abs(Math.round(trendOrders * 10) / 10),
      trendIsPositive: trendOrders >= 0,
    },
    awaitingConfirmation: {
      value:            Number(k.pendingConfirmation ?? k.PendingConfirmation ?? 0),
      maxDelayMinutes:  Number(k.maxWaitMinutes ?? k.MaxWaitMinutes ?? 0),
    },
    deliveryRate: {
      value:           Math.round(deliveryRate * 10) / 10,
      weeklyTrendPct:  Math.round(weeklyTrend * 10) / 10,
    },
    outOfStockItems: {
      value:    Number(k.outOfStockArticles ?? k.OutOfStockArticles ?? 0),
      newToday: Number(k.newOutOfStockToday ?? k.NewOutOfStockToday ?? 0),
    },
  };
};

// ─── Confirmation queue ─────────────────────────────────────────────────────
const transformQueueItem = (q) => {
  const wilaya = q.wilaya ?? q.Wilaya;
  const risk   = normalizeRisk(q.risk ?? q.Risk);
  const phone  = q.clientPhone ?? q.ClientPhone;
  const code   = wilayaCode(wilaya);
  const isNew  = Boolean(q.isNewClient ?? q.IsNewClient);
  const orderCount = Number(q.clientOrderCount ?? q.ClientOrderCount ?? 0);
  let note = q.clientName ?? q.ClientName ?? 'Client';
  if (isNew) note = 'Nouveau client';
  else if (orderCount > 1) note = `${orderCount} commande(s)`;

  return {
    orderId:       q.orderId ?? q.OrderId,
    reference:     q.orderNumber ?? q.OrderNumber ?? q.orderId ?? q.OrderId,
    client:        formatPhoneE164(phone),
    note,
    wilaya:        `${wilayaLabel(wilaya)} (${code})`,
    amountDZD:     Number(q.amount ?? q.Amount ?? 0),
    risk,
    status:        String(q.status ?? q.Status ?? 'pending').toLowerCase(),
    timerMinutes:  Number(q.waitingMinutes ?? q.WaitingMinutes ?? 0),
  };
};

const transformConfirmationQueue = (queue) => {
  const list = Array.isArray(queue) ? queue : [];
  return {
    pending: list.length,
    items:   list.map(transformQueueItem),
  };
};

// ─── COD funnel ─────────────────────────────────────────────────────────────
// Frontend (apps/web/modules/dashboard/types.ts) expects a flat array of
// `{ state, count }` so the existing transformer/UI consumers keep working
// without a frontend change. Order is preserved end-to-end so the chart
// renders left→right correctly.
const FUNNEL_FIELDS = [
  ['passees',    'Placed'],
  ['confirmees', 'Confirmed'],
  ['expediees',  'Shipped'],
  ['livrees',    'Delivered'],
  ['remises',    'Remitted'],
  ['retournees', 'Returned'],
];

const transformCodFunnel = (f) => {
  if (!f) return null;
  const pickStep = (keyLower) => {
    const keyUpper = keyLower.charAt(0).toUpperCase() + keyLower.slice(1);
    return f[keyLower] ?? f[keyUpper] ?? { count: 0, percentage: 0 };
  };
  return FUNNEL_FIELDS.map(([k, label]) => {
    const step = pickStep(k);
    return {
      state:      label,
      count:      Number(step.count ?? step.Count ?? 0),
      percentage: Number(step.percentage ?? step.Percentage ?? 0),
    };
  });
};

// ─── Risk score donut ───────────────────────────────────────────────────────
// Frontend contract is `{ low, medium, high }`. We expose `total` and the
// percentage `distribution` as additional (forward-compatible) keys.
const transformRiskScore = (r) => {
  if (!r) return null;
  return {
    low:    Number(r.faibleCount ?? r.FaibleCount ?? 0),
    medium: Number(r.moyenCount  ?? r.MoyenCount  ?? 0),
    high:   Number(r.eleveCount  ?? r.EleveCount  ?? 0),
    total:  Number(r.totalOrders ?? r.TotalOrders ?? 0),
    distribution: {
      low:    Number(r.faiblePct ?? r.FaiblePct ?? 0),
      medium: Number(r.moyenPct  ?? r.MoyenPct  ?? 0),
      high:   Number(r.elevePct  ?? r.ElevePct  ?? 0),
    },
  };
};

// ─── Full summary ───────────────────────────────────────────────────────────
const transformDashboardSummary = (s) => {
  if (!s) return null;
  return {
    stats:         transformKpis(s.kpis ?? s.Kpis),
    confirmations: transformConfirmationQueue(s.confirmationQueue ?? s.ConfirmationQueue ?? []),
    codFunnel:     transformCodFunnel(s.codFunnel ?? s.CodFunnel),
    riskScore:     transformRiskScore(s.riskScore ?? s.RiskScore),
  };
};

module.exports = {
  transformDashboardSummary,
  transformKpis,
  transformConfirmationQueue,
  transformCodFunnel,
  transformRiskScore,
};
