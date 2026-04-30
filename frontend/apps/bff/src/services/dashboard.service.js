const orderService = require('./order.service');
const inventoryService = require('./inventory.service');
const ticketsService = require('./crm-tickets.service');
const procurementService = require('./procurement.service');
const { computeStats } = require('./oms-stats.service');

// ─── Shared constants ───────────────────────────────────────────────────────

const WILAYA_LABELS = {
  '16': 'Alger', '31': 'Oran', '25': 'Constantine', '19': 'Setif', '23': 'Annaba',
  '06': 'Bejaia', '09': 'Blida', '05': 'Batna', '13': 'Tlemcen', '15': 'Tizi Ouzou',
  '35': 'Boumerdes', '08': 'Bechar', '29': 'Mascara', '41': 'Souk Ahras', '43': 'Mila',
  '02': 'Chlef', '18': 'Jijel', '28': "M'sila", '07': 'Biskra', '10': 'Bouira',
};

const CONFIRMED_DOWNSTREAM = new Set([
  'Confirmed', 'AwaitingPickup', 'HandedToCarrier', 'OutForDelivery',
  'DeliveredCOD_Confirmed', 'COD_Remitted',
]);

const SHIPPED_DOWNSTREAM = new Set([
  'HandedToCarrier', 'OutForDelivery', 'DeliveredCOD_Confirmed', 'COD_Remitted',
]);

const DELIVERED_STATES = new Set(['DeliveredCOD_Confirmed', 'COD_Remitted']);

// ─── Small helpers ──────────────────────────────────────────────────────────

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const minutesAgo = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));

const minutesUntil = (iso) => Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60_000));

const formatPhoneE164 = (phone) => {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('213')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+213 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
};

const relativeDayLabel = (iso) => {
  if (!iso) return '—';
  const today = startOfToday();
  const that = new Date(iso);
  const thatDay = new Date(that);
  thatDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - thatDay.getTime()) / 86_400_000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 0) return `Dans ${Math.abs(diffDays)} jour(s)`;
  return `${diffDays} jours`;
};

// ─── Section builders ───────────────────────────────────────────────────────

const buildStats = (orders, alerts, omsStats) => {
  const today = startOfToday();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const ordersToday = orders.filter((o) => new Date(o.createdAt) >= today).length;
  const ordersYesterday = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= yesterday && d < today;
  }).length;
  const rawTrend = ordersYesterday > 0
    ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100)
    : 0;

  const awaitingCount = orders.filter((o) => o.status === 'AwaitingValidation').length;
  const deliveryRate = (omsStats?.tauxLivraison ?? 0) * 100;

  const outOfStock = alerts.filter((a) => (a.quantityAvailable ?? 0) <= 0).length;
  const outNewToday = alerts.filter((a) => {
    if ((a.quantityAvailable ?? 0) > 0) return false;
    const last = a.lastMovementAt ? new Date(a.lastMovementAt) : null;
    return last && last >= today;
  }).length;

  return {
    ordersToday: {
      value: ordersToday,
      trendPct: Math.abs(rawTrend),
      trendIsPositive: rawTrend >= 0,
    },
    awaitingConfirmation: { value: awaitingCount, maxDelayMinutes: 120 },
    deliveryRate: {
      value: Math.round(deliveryRate * 10) / 10,
      weeklyTrendPct: 0,
    },
    outOfStockItems: { value: outOfStock, newToday: outNewToday },
  };
};

const buildConfirmations = (orders) => {
  const pending = orders.filter((o) => o.status === 'AwaitingValidation');
  pending.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const items = pending.slice(0, 5).map((o) => {
    const wilaya = WILAYA_LABELS[o.wilayaCode] ?? 'Inconnu';
    const timerMinutes = o.autoCancelAt ? minutesUntil(o.autoCancelAt) : null;
    const risk = (o.riskLevel ?? 'LOW').toLowerCase();
    const safeRisk = ['low', 'medium', 'high'].includes(risk) ? risk : 'low';
    let note = 'Client';
    if (o.customer?.blacklisted) note = 'Blacklist';
    else if ((o.deliveryAttempts ?? 0) > 0) note = `${o.deliveryAttempts} tentative(s)`;
    else if (o.noteInterne) note = o.noteInterne;
    return {
      orderId: o.id,
      reference: o.reference ?? o.id,
      client: formatPhoneE164(o.customerPhone),
      note,
      wilaya: `${wilaya} (${o.wilayaCode ?? '--'})`,
      amountDZD: o.totalTTC ?? o.codAmount ?? 0,
      risk: safeRisk,
      status: 'pending',
      timerMinutes,
    };
  });
  return { pending: pending.length, items };
};

const buildCodFunnel = (orders) => {
  const countBy = (predicate) => orders.filter(predicate).length;
  return [
    { state: 'Placed', count: orders.length },
    { state: 'Confirmed', count: countBy((o) => CONFIRMED_DOWNSTREAM.has(o.status)) },
    { state: 'Shipped', count: countBy((o) => SHIPPED_DOWNSTREAM.has(o.status)) },
    { state: 'Delivered', count: countBy((o) => DELIVERED_STATES.has(o.status)) },
    { state: 'Remitted', count: countBy((o) => o.status === 'COD_Remitted') },
    { state: 'Returned', count: countBy((o) => o.status === 'Returned') },
  ];
};

const buildRiskScore = (orders) => {
  const today = startOfToday();
  const todays = orders.filter((o) => new Date(o.createdAt) >= today);
  const countBy = (level) => todays.filter((o) => (o.riskLevel ?? 'LOW').toUpperCase() === level).length;
  return {
    low: countBy('LOW'),
    medium: countBy('MEDIUM'),
    high: countBy('HIGH'),
  };
};

const ticketToKind = (ticket) => {
  const cat = ticket.category ?? '';
  if (ticket.status === 'Résolu' || ticket.status === 'Resolu') return 'delivered';
  if (ticket.escalated) return 'blacklisted';
  if (cat.includes('endommagé') || cat.includes('endommage')) return 'blacklisted';
  if (cat.includes('Retard')) return 'absence';
  if (cat.includes('Annulation')) return 'segment-change';
  if (ticket.priority === 'Haute') return 'blacklisted';
  return 'otp';
};

const buildCrmActivity = (tickets) => {
  const sorted = [...tickets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return sorted.slice(0, 5).map((t) => ({
    kind: ticketToKind(t),
    phone: formatPhoneE164(t.customerPhone),
    summary: t.lastAction ?? t.subject ?? t.category ?? '—',
    atMinutesAgo: minutesAgo(t.updatedAt),
  }));
};

const levelFromAlert = (alert) => {
  const qty = alert.quantityAvailable ?? 0;
  const threshold = alert.reorderPoint ?? 0;
  if (qty <= 0) return 'rupture';
  if (threshold > 0 && qty <= threshold / 2) return 'critical';
  return 'low';
};

const buildInventoryAlerts = (alerts) => {
  const sorted = [...alerts].sort(
    (a, b) => (a.quantityAvailable ?? 0) - (b.quantityAvailable ?? 0),
  );
  return sorted.slice(0, 5).map((a) => ({
    sku: a.sku,
    level: levelFromAlert(a),
    product: a.nameFr ?? a.sku,
    remaining: a.quantityAvailable ?? 0,
    threshold: a.reorderPoint ?? 0,
    warehouse: 'Alger Entrepot',
  }));
};

const bcToUiStatus = (status) => {
  switch (status) {
    case 'PendingApproval':
      return 'approval';
    case 'Approved':
    case 'SentToSupplier':
    case 'PartiallyReceived':
      return 'sent';
    case 'FullyReceived':
    case 'Invoiced':
      return 'received';
    default:
      return 'approval';
  }
};

const buildProcurement = (bcs) => {
  const active = bcs.filter((bc) => !['Rejected', 'Draft'].includes(bc.status));
  active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const purchaseOrders = active.slice(0, 3).map((bc) => ({
    bcId: bc.id,
    reference: bc.reference ?? bc.id,
    supplier: bc.supplierName ?? 'Fournisseur',
    status: bcToUiStatus(bc.status),
    delayLabel: relativeDayLabel(bc.createdAt),
  }));

  const partial = bcs.filter((bc) => bc.status === 'PartiallyReceived');
  const receptions = partial.slice(0, 2).map((bc) => {
    const totalOrdered = (bc.items ?? []).reduce((sum, it) => sum + (it.quantityOrdered ?? 0), 0);
    const totalReceived = (bc.items ?? []).reduce((sum, it) => sum + (it.quantityReceived ?? 0), 0);
    const ref = String(bc.reference ?? bc.id);
    return {
      bcId: bc.id,
      reference: ref.replace(/^BC[-\s]?/i, 'BR-'),
      details: `${totalReceived} sur ${totalOrdered} articles recus`,
      status: 'Mettre a jour',
      isActionable: true,
    };
  });

  return { purchaseOrders, receptions };
};

// ─── Orchestrator ────────────────────────────────────────────────────────────

const getDashboard = async () => {
  const [ordersRes, alertsRes, ticketsRes, bcsRes] = await Promise.allSettled([
    orderService.getOrders({ page: 1, pageSize: 1000 }),
    inventoryService.getAlerts(),
    ticketsService.getTickets({ page: 1, pageSize: 50 }),
    procurementService.getBCs({ page: 1, pageSize: 100 }),
  ]);

  const errors = [];
  const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data ?? []) : [];
  if (ordersRes.status === 'rejected') errors.push({ source: 'oms', message: ordersRes.reason?.message ?? 'unknown' });

  const alerts = alertsRes.status === 'fulfilled' ? (alertsRes.value ?? []) : [];
  if (alertsRes.status === 'rejected') errors.push({ source: 'inventory', message: alertsRes.reason?.message ?? 'unknown' });

  const tickets = ticketsRes.status === 'fulfilled' ? (ticketsRes.value.data ?? []) : [];
  if (ticketsRes.status === 'rejected') errors.push({ source: 'crm', message: ticketsRes.reason?.message ?? 'unknown' });

  const bcs = bcsRes.status === 'fulfilled' ? (bcsRes.value.data ?? []) : [];
  if (bcsRes.status === 'rejected') errors.push({ source: 'procurement', message: bcsRes.reason?.message ?? 'unknown' });

  const omsStats = orders.length > 0 ? computeStats(orders) : null;

  return {
    generatedAt: new Date().toISOString(),
    stats: omsStats ? buildStats(orders, alerts, omsStats) : null,
    confirmations: orders.length > 0 ? buildConfirmations(orders) : null,
    codFunnel: orders.length > 0 ? buildCodFunnel(orders) : null,
    riskScore: orders.length > 0 ? buildRiskScore(orders) : null,
    crmActivity: tickets.length > 0 ? buildCrmActivity(tickets) : null,
    inventoryAlerts: alerts.length > 0 ? buildInventoryAlerts(alerts) : null,
    procurement: bcs.length > 0 ? buildProcurement(bcs) : null,
    degraded: errors.length > 0,
    sources: {
      oms: ordersRes.status === 'fulfilled' ? 'ok' : 'down',
      inventory: alertsRes.status === 'fulfilled' ? 'ok' : 'down',
      crm: ticketsRes.status === 'fulfilled' ? 'ok' : 'down',
      procurement: bcsRes.status === 'fulfilled' ? 'ok' : 'down',
    },
    errors: errors.length > 0 ? errors : undefined,
  };
};

module.exports = { getDashboard };
