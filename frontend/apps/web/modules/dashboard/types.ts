// ─── Raw BFF shape (matches apps/bff/src/mocks/dashboard.mock.js) ────────────

export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfirmationStatus = 'pending' | 'confirmed' | 'cancelled';
export type InventoryAlertLevel = 'rupture' | 'critical' | 'low';
export type PurchaseOrderStatus = 'approval' | 'sent' | 'received';
export type CodFunnelState =
  | 'Placed'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Remitted'
  | 'Returned'
  | 'AwaitingValidation'
  | 'HandedToCarrier'
  | 'OutForDelivery'
  | 'DeliveredCOD_Confirmed';

export interface RawDashboardDTO {
  generatedAt: string;
  stats: {
    ordersToday: { value: number; trendPct: number; trendIsPositive: boolean };
    awaitingConfirmation: { value: number; maxDelayMinutes: number };
    deliveryRate: { value: number; weeklyTrendPct: number };
    outOfStockItems: { value: number; newToday: number };
  } | null;
  confirmations: {
    pending: number;
    items: Array<{
      orderId: string;
      reference: string;
      client: string;
      note: string;
      wilaya: string;
      amountDZD: number;
      risk: RiskLevel;
      status: ConfirmationStatus;
      timerMinutes: number | null;
    }>;
  } | null;
  codFunnel: Array<{ state: CodFunnelState; count: number }> | null;
  riskScore: { low: number; medium: number; high: number } | null;
  crmActivity: Array<{
    kind: 'absence' | 'delivered' | 'blacklisted' | 'segment-change' | 'otp';
    phone: string;
    summary: string;
    atMinutesAgo: number;
  }> | null;
  inventoryAlerts: Array<{
    sku: string;
    level: InventoryAlertLevel;
    product: string;
    remaining: number;
    threshold: number;
    warehouse: string;
  }> | null;
  procurement: {
    purchaseOrders: Array<{
      bcId: string;
      reference: string;
      supplier: string;
      status: PurchaseOrderStatus;
      delayLabel: string;
    }>;
    receptions: Array<{
      bcId: string;
      reference: string;
      details: string;
      status: string;
      isActionable: boolean;
    }>;
  } | null;
  degraded: boolean;
  sources: Record<string, string>;
  errors?: Array<{ source: string; message: string }>;
}

// ─── UI-ready shapes ─────────────────────────────────────────────────────────

export interface DashboardStatsVM {
  ordersToday: { value: string; trendLabel: string; trendIsPositive: boolean };
  awaitingConfirmation: { value: string; helper: string };
  deliveryRate: { valueLabel: string; progressValue: number; trendLabel: string };
  outOfStockItems: { value: string; trendLabel: string };
}

export interface ConfirmationRowVM {
  orderId: string;
  reference: string;
  client: string;
  note: string;
  wilaya: string;
  montant: string;
  risque: { label: string; tone: 'success' | 'warning' | 'error' };
  statut: { label: string; tone: 'primary' | 'success' | 'warning' | 'error' | 'default' };
  minuterie: { label: string; tone: 'success' | 'warning' | 'error' | 'default' };
}

export interface ConfirmationsVM {
  pending: number;
  rows: ConfirmationRowVM[];
}

export interface CodFunnelRowVM {
  label: string;
  value: number;
  percent: number;
  tone: 'primary' | 'info' | 'secondary' | 'success' | 'teal' | 'error';
}

export interface CodFunnelVM {
  total: number;
  rows: CodFunnelRowVM[];
}

export interface RiskScoreSegmentVM {
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'error';
}

export interface RiskScoreVM {
  total: number;
  segments: RiskScoreSegmentVM[];
}

export interface CrmActivityItemVM {
  key: string;
  iconKey: 'absence' | 'delivered' | 'blacklisted' | 'segment-change' | 'otp';
  tone: 'error' | 'success' | 'warning' | 'info';
  text: string;
  sub: string;
  time: string;
}

export interface InventoryAlertVM {
  sku: string;
  level: { label: string; tone: 'error' | 'warning' | 'info' };
  product: string;
  details: string;
}

export interface InventoryAlertsVM {
  criticalCount: number;
  items: InventoryAlertVM[];
}

export interface ProcurementOrderVM {
  bcId: string;
  reference: string;
  supplier: string;
  status: { label: string; tone: 'warning' | 'info' | 'success' };
  delay: string;
}

export interface ProcurementReceiptVM {
  bcId: string;
  reference: string;
  details: string;
  status: string;
  isActionable: boolean;
}

export interface ProcurementVM {
  purchaseOrders: ProcurementOrderVM[];
  receptions: ProcurementReceiptVM[];
}

export interface DashboardVM {
  generatedAt: string;
  degraded: boolean;
  stats: DashboardStatsVM | null;
  confirmations: ConfirmationsVM | null;
  codFunnel: CodFunnelVM | null;
  riskScore: RiskScoreVM | null;
  crmActivity: CrmActivityItemVM[] | null;
  inventoryAlerts: InventoryAlertsVM | null;
  procurement: ProcurementVM | null;
}
