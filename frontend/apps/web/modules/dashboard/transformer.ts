import type {
  CodFunnelState,
  CodFunnelVM,
  ConfirmationsVM,
  CrmActivityItemVM,
  DashboardStatsVM,
  DashboardVM,
  InventoryAlertLevel,
  InventoryAlertsVM,
  ProcurementVM,
  PurchaseOrderStatus,
  RawDashboardDTO,
  RiskLevel,
  RiskScoreVM,
} from './types';

// ─── Formatters ──────────────────────────────────────────────────────────────

const dzdFormatter = new Intl.NumberFormat('fr-DZ', {
  useGrouping: true,
  maximumFractionDigits: 0,
});

const formatDZD = (amount: number): string => `${dzdFormatter.format(amount)} DZD`;

const formatTimer = (minutes: number | null): { label: string; tone: 'success' | 'warning' | 'error' | 'default' } => {
  if (minutes === null || minutes === undefined) return { label: '--', tone: 'default' };
  if (minutes < 30) return { label: `${minutes}min`, tone: 'error' };
  if (minutes < 60) return { label: `${minutes}min`, tone: 'success' };
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return { label: m === 0 ? `${h}h` : `${h}h ${m}min`, tone: 'success' };
};

const formatRelativeMinutes = (minutesAgo: number): string => {
  if (minutesAgo < 1) return 'maintenant';
  if (minutesAgo < 60) return `il y a ${minutesAgo} min`;
  const h = Math.floor(minutesAgo / 60);
  return h === 1 ? 'il y a 1 h' : `il y a ${h} h`;
};

// ─── Maps ────────────────────────────────────────────────────────────────────

const RISK_LABELS: Record<RiskLevel, { label: string; tone: 'success' | 'warning' | 'error' }> = {
  low: { label: 'Faible', tone: 'success' },
  medium: { label: 'Moyen', tone: 'warning' },
  high: { label: 'Eleve', tone: 'error' },
};

const STATUS_LABELS: Record<
  'pending' | 'confirmed' | 'cancelled',
  { label: string; tone: 'warning' | 'primary' | 'error' }
> = {
  pending: { label: 'En Attente', tone: 'warning' },
  confirmed: { label: 'Confirme', tone: 'primary' },
  cancelled: { label: 'Annule', tone: 'error' },
};

const COD_FUNNEL_LABELS: Record<
  CodFunnelState,
  { label: string; tone: 'primary' | 'info' | 'secondary' | 'success' | 'teal' | 'error' }
> = {
  Placed: { label: 'Passees', tone: 'primary' },
  AwaitingValidation: { label: 'Passees', tone: 'primary' },
  Confirmed: { label: 'Confirmees', tone: 'info' },
  Shipped: { label: 'Expediees', tone: 'secondary' },
  HandedToCarrier: { label: 'Expediees', tone: 'secondary' },
  OutForDelivery: { label: 'Expediees', tone: 'secondary' },
  Delivered: { label: 'Livrees', tone: 'success' },
  DeliveredCOD_Confirmed: { label: 'Livrees', tone: 'success' },
  Remitted: { label: 'Remises', tone: 'teal' },
  Returned: { label: 'Retournees', tone: 'error' },
};

const INVENTORY_LEVEL_LABELS: Record<InventoryAlertLevel, { label: string; tone: 'error' | 'warning' | 'info' }> = {
  rupture: { label: 'RUPTURE', tone: 'error' },
  critical: { label: 'CRITIQUE', tone: 'warning' },
  low: { label: 'FAIBLE', tone: 'info' },
};

const PO_STATUS_LABELS: Record<PurchaseOrderStatus, { label: string; tone: 'warning' | 'info' | 'success' }> = {
  approval: { label: 'Approbation', tone: 'warning' },
  sent: { label: 'Envoye', tone: 'info' },
  received: { label: 'Recu', tone: 'success' },
};

const CRM_TONE: Record<CrmActivityItemVM['iconKey'], CrmActivityItemVM['tone']> = {
  absence: 'error',
  delivered: 'success',
  blacklisted: 'error',
  'segment-change': 'info',
  otp: 'warning',
};

// ─── Section transformers ────────────────────────────────────────────────────

const toStats = (raw: RawDashboardDTO['stats']): DashboardStatsVM | null => {
  if (!raw) return null;
  const deliveryWeekly = raw.deliveryRate.weeklyTrendPct;
  const weeklySign = deliveryWeekly > 0 ? '+' : '';
  const outNewSign = raw.outOfStockItems.newToday > 0 ? '+' : '';
  return {
    ordersToday: {
      value: String(raw.ordersToday.value),
      trendLabel: `${raw.ordersToday.trendIsPositive ? '+' : '-'}${Math.abs(raw.ordersToday.trendPct)}% vs hier`,
      trendIsPositive: raw.ordersToday.trendIsPositive,
    },
    awaitingConfirmation: {
      value: String(raw.awaitingConfirmation.value),
      helper: `Delai max ${raw.awaitingConfirmation.maxDelayMinutes} min`,
    },
    deliveryRate: {
      valueLabel: `${raw.deliveryRate.value.toFixed(1)}%`,
      progressValue: Math.round(raw.deliveryRate.value),
      trendLabel: `${weeklySign}${deliveryWeekly}% cette semaine`,
    },
    outOfStockItems: {
      value: String(raw.outOfStockItems.value),
      trendLabel: `${outNewSign}${raw.outOfStockItems.newToday} nouveaux aujourd'hui`,
    },
  };
};

const toConfirmations = (raw: RawDashboardDTO['confirmations']): ConfirmationsVM | null => {
  if (!raw) return null;
  return {
    pending: raw.pending,
    rows: raw.items.map((item) => ({
      orderId: item.orderId,
      reference: item.reference,
      client: item.client,
      note: item.note,
      wilaya: item.wilaya,
      montant: formatDZD(item.amountDZD),
      risque: RISK_LABELS[item.risk] ?? { label: '—', tone: 'success' },
      statut: STATUS_LABELS[item.status] ?? { label: '—', tone: 'default' as const },
      minuterie: formatTimer(item.timerMinutes),
    })),
  };
};

const toCodFunnel = (raw: RawDashboardDTO['codFunnel']): CodFunnelVM | null => {
  if (!raw || raw.length === 0) return null;
  const total = raw.reduce((acc, r) => Math.max(acc, r.count), 0);
  const rows = raw.map((r) => {
    const mapping = COD_FUNNEL_LABELS[r.state] ?? { label: r.state, tone: 'primary' as const };
    const percent = total > 0 ? Math.round((r.count / total) * 100) : 0;
    return { label: mapping.label, value: r.count, percent, tone: mapping.tone };
  });
  return { total, rows };
};

const toRiskScore = (raw: RawDashboardDTO['riskScore']): RiskScoreVM | null => {
  if (!raw) return null;
  const segments: RiskScoreVM['segments'] = [
    { label: 'Faible', value: raw.low, tone: 'success' },
    { label: 'Moyen', value: raw.medium, tone: 'warning' },
    { label: 'Eleve', value: raw.high, tone: 'error' },
  ];
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  return { total, segments };
};

const toCrmActivity = (raw: RawDashboardDTO['crmActivity']): CrmActivityItemVM[] | null => {
  if (!raw) return null;
  return raw.map((item, idx) => ({
    key: `${item.phone}-${idx}`,
    iconKey: item.kind,
    tone: CRM_TONE[item.kind] ?? 'info',
    text: item.phone,
    sub: item.summary,
    time: formatRelativeMinutes(item.atMinutesAgo),
  }));
};

const toInventoryAlerts = (raw: RawDashboardDTO['inventoryAlerts']): InventoryAlertsVM | null => {
  if (!raw) return null;
  const items = raw.map((alert) => {
    const level = INVENTORY_LEVEL_LABELS[alert.level] ?? { label: alert.level.toUpperCase(), tone: 'info' as const };
    const details =
      alert.remaining === 0
        ? `0 unites - ${alert.warehouse}`
        : `${alert.remaining} unites - Seuil: ${alert.threshold}`;
    return { sku: alert.sku, level, product: alert.product, details };
  });
  const criticalCount = raw.filter((a) => a.level === 'rupture' || a.level === 'critical').length;
  return { criticalCount, items };
};

const toProcurement = (raw: RawDashboardDTO['procurement']): ProcurementVM | null => {
  if (!raw) return null;
  return {
    purchaseOrders: raw.purchaseOrders.map((o) => ({
      bcId: o.bcId,
      reference: o.reference,
      supplier: o.supplier,
      status: PO_STATUS_LABELS[o.status] ?? { label: o.status, tone: 'info' as const },
      delay: o.delayLabel,
    })),
    receptions: raw.receptions.map((r) => ({
      bcId: r.bcId,
      reference: r.reference,
      details: r.details,
      status: r.status,
      isActionable: r.isActionable,
    })),
  };
};

// ─── Root transformer ────────────────────────────────────────────────────────

export const transformDashboard = (raw: RawDashboardDTO): DashboardVM => ({
  generatedAt: raw.generatedAt,
  degraded: raw.degraded,
  stats: toStats(raw.stats),
  confirmations: toConfirmations(raw.confirmations),
  codFunnel: toCodFunnel(raw.codFunnel),
  riskScore: toRiskScore(raw.riskScore),
  crmActivity: toCrmActivity(raw.crmActivity),
  inventoryAlerts: toInventoryAlerts(raw.inventoryAlerts),
  procurement: toProcurement(raw.procurement),
});
