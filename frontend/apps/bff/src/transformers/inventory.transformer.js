// ─────────────────────────────────────────────────────────────────────────────
// Engine-A inventory transformers
//
// Engine-A is the source of truth. Its DTOs use:
//   - skuCode, stockRecordId, totalQuantity, available, softReserved, hardReserved
//   - reorderThreshold, reorderQuantity, fifoValuation, weightedAvgCost
//   - status: IN_STOCK | LOW_STOCK | OUT_OF_STOCK
//
// The frontend contract (see InventoryItem) uses:
//   - sku, stockRecordId, quantityOnHand, quantityAvailable, quantityReserved
//   - quantityQuarantined, reorderPoint, costFifo, weightedAverageCost
//   - stockStatus: 'rupture' | 'faible' | 'disponible'
//
// All transformers in this file map Engine-A → frontend without inventing
// fields. Anything Engine-A does not own (PIM names, supplier info) is left
// alone here and joined by the cross-module helpers in the service layer.
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_FROM_ENGINE = {
  IN_STOCK: 'disponible',
  LOW_STOCK: 'faible',
  OUT_OF_STOCK: 'rupture',
};

const STATUS_TO_ENGINE = {
  disponible: 'IN_STOCK',
  faible: 'LOW_STOCK',
  rupture: 'OUT_OF_STOCK',
};

const numberOrZero = (value) => {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// ── Stock records ───────────────────────────────────────────────────────────

const transformStockRecord = (raw = {}) => {
  if (!raw) return null;

  const totalQuantity = numberOrZero(raw.totalQuantity);
  const softReserved = numberOrZero(raw.softReserved);
  const hardReserved = numberOrZero(raw.hardReserved);
  const quarantine = numberOrZero(raw.quarantine);
  const available = numberOrZero(raw.available);
  const reorderPoint = numberOrZero(raw.reorderThreshold);

  return {
    stockRecordId: raw.stockRecordId,
    sku: raw.skuCode,
    productId: raw.productId,
    variantId: raw.variantId,
    tenantId: raw.tenantId,

    quantityOnHand: totalQuantity,
    quantityAvailable: available,
    quantityReserved: softReserved + hardReserved,
    softReserved,
    hardReserved,
    quantityQuarantined: quarantine,

    reorderPoint,
    reorderQuantity: numberOrZero(raw.reorderQuantity),

    trackable: Boolean(raw.trackable),
    frozen: Boolean(raw.frozen),

    stockStatus: STATUS_FROM_ENGINE[raw.status] ?? null,
    rawStatus: raw.status ?? null,

    costFifo: numberOrZero(raw.fifoValuation),
    weightedAverageCost: numberOrZero(raw.weightedAvgCost),
    stockValue: numberOrZero(raw.stockValue),

    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    lastMovementAt: raw.updatedAt ?? null,
    version: raw.version ?? 0,
  };
};

const transformStockRecordList = (rawList = []) =>
  (rawList || []).map(transformStockRecord);

// ── Pagination ──────────────────────────────────────────────────────────────

// Engine-A returns a Spring Page payload OR an `ApiResult.paged()` envelope.
// Either way the client surfaces `data` (page content) and `pagination` info.
//
// Frontend pagination contract: { total, page (1-based), pageSize }.
const transformPagination = (raw, fallback = { page: 1, pageSize: 20 }) => {
  if (!raw) {
    return {
      total: 0,
      page: fallback.page,
      pageSize: fallback.pageSize,
      totalPages: 0,
    };
  }

  // Spring Page object inside `data`
  if (Array.isArray(raw.content)) {
    return {
      total: numberOrZero(raw.totalElements),
      page: numberOrZero(raw.number) + 1,
      pageSize: numberOrZero(raw.size) || fallback.pageSize,
      totalPages: numberOrZero(raw.totalPages),
    };
  }

  // ApiResult.paged PageInfo
  if ('totalElements' in raw || 'page' in raw) {
    return {
      total: numberOrZero(raw.totalElements),
      page: numberOrZero(raw.page) + 1,
      pageSize: numberOrZero(raw.size) || fallback.pageSize,
      totalPages: numberOrZero(raw.totalPages),
    };
  }

  return {
    total: 0,
    page: fallback.page,
    pageSize: fallback.pageSize,
    totalPages: 0,
  };
};

// Normalize a paginated Engine-A list response. Accepts:
// - { data: { content: [...], totalElements, number, size, totalPages } }
// - { data: [...], pagination: { page, size, totalElements, totalPages } }
const transformPagedStockRecords = ({ data, pagination } = {}, fallback) => {
  if (data && Array.isArray(data.content)) {
    return {
      data: transformStockRecordList(data.content),
      meta: transformPagination(data, fallback),
    };
  }
  return {
    data: transformStockRecordList(Array.isArray(data) ? data : []),
    meta: transformPagination(pagination, fallback),
  };
};

// ── Movements ───────────────────────────────────────────────────────────────

// Engine-A movement types → frontend movement types
const MOVEMENT_TYPE_FROM_ENGINE = {
  RECEPTION: 'receipt',
  SOFT_RESERVE: 'soft_reserve',
  HARD_RESERVE: 'hard_reserve',
  RESERVE_RELEASE: 'reserve_release',
  SOFT_TO_HARD_UPGRADE: 'reserve_upgrade',
  EXPEDITION: 'sale',
  RETURN_QUARANTINE: 'return',
  RETURN_APPROVED: 'return_approved',
  RETURN_REJECTED: 'return_rejected',
  ADJUSTMENT_IN: 'adjustment',
  ADJUSTMENT_OUT: 'adjustment',
};

const transformMovement = (raw = {}) => {
  if (!raw) return null;
  const change = numberOrZero(raw.quantityChange);
  return {
    id: raw.movementId,
    sku: raw.skuCode,
    type: MOVEMENT_TYPE_FROM_ENGINE[raw.movementType] || raw.movementType?.toLowerCase() || 'unknown',
    rawType: raw.movementType ?? null,
    quantity: change,
    quantityBefore: numberOrZero(raw.quantityBefore),
    quantityAfter: numberOrZero(raw.quantityAfter),
    unitCostHT: numberOrZero(raw.unitCost),
    totalCost: numberOrZero(raw.totalCost),
    referenceType: raw.referenceType ?? null,
    referenceId: raw.referenceId ?? null,
    reason: raw.reason ?? null,
    description: raw.reason ?? null,
    performedBy: raw.performedBy ?? null,
    createdAt: raw.performedAt ?? null,
    auditHash: raw.auditHash ?? null,
  };
};

const transformMovementList = (rawList = []) =>
  (rawList || []).map(transformMovement);

const transformPagedMovements = ({ data, pagination } = {}, fallback) => {
  if (data && Array.isArray(data.content)) {
    return {
      data: transformMovementList(data.content),
      meta: transformPagination(data, fallback),
    };
  }
  return {
    data: transformMovementList(Array.isArray(data) ? data : []),
    meta: transformPagination(pagination, fallback),
  };
};

// ── FIFO ────────────────────────────────────────────────────────────────────

const transformFifoLayer = (raw = {}) => ({
  layerId: raw.layerId,
  layerNumber: numberOrZero(raw.layerNumber),
  receivedAt: raw.receptionDate ?? null,
  purchaseOrderRef: raw.purchaseOrderRef ?? null,
  supplierCode: raw.supplierCode ?? null,
  quantityInitial: numberOrZero(raw.initialQuantity),
  quantityRemaining: numberOrZero(raw.remainingQuantity),
  unitCostHT: numberOrZero(raw.unitCost),
  remainingValue: numberOrZero(raw.remainingValue),
  status: raw.status ?? null,
});

const transformFifoLayers = (rawList = []) =>
  (rawList || []).map(transformFifoLayer);

const transformFifoSummary = (raw = {}) => ({
  activeLayersCount: numberOrZero(raw.activeLayersCount),
  totalFifoStock: numberOrZero(raw.totalFifoStock),
  weightedAverageCost: numberOrZero(raw.weightedAvgCost),
  totalValue: numberOrZero(raw.totalValue),
  nextSaleInfo: raw.nextSaleInfo ?? null,
});

// ── Dashboard ───────────────────────────────────────────────────────────────

const transformDashboard = (raw = {}) => ({
  stockValue: numberOrZero(raw.totalFifoValuation),
  units: numberOrZero(raw.totalVariants),
  ruptures: numberOrZero(raw.outOfStockCount),
  lowStock: numberOrZero(raw.belowThresholdCount),
  totalSoftReserved: numberOrZero(raw.totalSoftReserved),
  totalHardReserved: numberOrZero(raw.totalHardReserved),
  movementsToday: numberOrZero(raw.movementsTodayIn) + numberOrZero(raw.movementsTodayOut),
  movementsTodaySplit: {
    incoming: numberOrZero(raw.movementsTodayIn),
    outgoing: numberOrZero(raw.movementsTodayOut),
  },
  totalVariants: numberOrZero(raw.totalVariants),
});

// ── Alerts ──────────────────────────────────────────────────────────────────

const transformAlert = (raw = {}) => ({
  alertId: raw.alertId,
  sku: raw.skuCode,
  alertType: raw.alertType,
  severity: raw.severity,
  message: raw.message ?? '',
  active: Boolean(raw.active),
  suggestedQuantity: raw.suggestedQuantity ?? null,
  supplierCode: raw.supplierCode ?? null,
  supplierLeadDays: raw.supplierLeadDays ?? null,
  triggeredAt: raw.triggeredAt ?? null,
  resolvedAt: raw.resolvedAt ?? null,
});

const transformAlertList = (rawList = []) => (rawList || []).map(transformAlert);

// ── Stock evolution ─────────────────────────────────────────────────────────

const transformEvolution = (raw = {}) => ({
  data: (raw.data || []).map((point) => ({
    date: point.date,
    quantity: numberOrZero(point.quantity),
  })),
  maxQuantity: numberOrZero(raw.maxQuantity),
  minQuantity: numberOrZero(raw.minQuantity),
  avgQuantity: numberOrZero(raw.avgQuantity),
});

// ── Reservations ────────────────────────────────────────────────────────────

const transformReservation = (raw = {}) => ({
  reservationId: raw.reservationId,
  sku: raw.skuCode,
  orderId: raw.orderId,
  clientRef: raw.clientRef ?? null,
  type: (raw.reservationType || '').toLowerCase() || null,
  reservationType: raw.reservationType ?? null,
  quantity: numberOrZero(raw.quantity),
  status: raw.status ?? null,
  omsStatus: raw.omsStatus ?? null,
  expiresAt: raw.expiresAt ?? null,
  reservedAt: raw.createdAt ?? null,
  createdAt: raw.createdAt ?? null,
});

const transformReservationList = (rawList = []) =>
  (rawList || []).map(transformReservation);

// ── Returns ─────────────────────────────────────────────────────────────────

const INSPECTION_STATUS_FROM_ENGINE = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const INSPECTION_STATUS_TO_ENGINE = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

const transformReturn = (raw = {}) => ({
  returnId: raw.inspectionId,
  inspectionId: raw.inspectionId,
  sku: raw.skuCode,
  orderId: raw.orderId,
  customerRef: raw.customerRef ?? null,
  returnedAt: raw.returnDate ?? null,
  reason: raw.returnReason ?? null,
  productCondition: raw.productCondition ?? null,
  quantity: numberOrZero(raw.quantity),
  status: INSPECTION_STATUS_FROM_ENGINE[raw.inspectionStatus] || (raw.inspectionStatus || '').toLowerCase(),
  rawStatus: raw.inspectionStatus ?? null,
  inspectorId: raw.inspectorId ?? null,
  inspectedAt: raw.inspectedAt ?? null,
  rejectionReason: raw.rejectionReason ?? null,
  disposition: raw.disposition ?? null,
});

const transformReturnList = (rawList = []) => (rawList || []).map(transformReturn);

const transformPagedReturns = ({ data, pagination } = {}, fallback) => {
  if (data && Array.isArray(data.content)) {
    return {
      data: transformReturnList(data.content),
      meta: transformPagination(data, fallback),
    };
  }
  return {
    data: transformReturnList(Array.isArray(data) ? data : []),
    meta: transformPagination(pagination, fallback),
  };
};

// ── Errors ──────────────────────────────────────────────────────────────────

const transformEngineError = (raw = {}) => {
  if (!raw || raw.success !== false) return null;
  const fieldErrors = raw.errors || {};
  const firstField = Object.keys(fieldErrors)[0];
  return {
    code: 'ENGINE_A_ERROR',
    message: raw.message || 'Erreur Engine-A.',
    field: firstField,
    fieldErrors,
  };
};

module.exports = {
  // stock records
  transformStockRecord,
  transformStockRecordList,
  transformPagedStockRecords,
  // pagination
  transformPagination,
  // movements
  transformMovement,
  transformMovementList,
  transformPagedMovements,
  // fifo
  transformFifoLayer,
  transformFifoLayers,
  transformFifoSummary,
  // dashboard / alerts / evolution
  transformDashboard,
  transformAlert,
  transformAlertList,
  transformEvolution,
  // reservations
  transformReservation,
  transformReservationList,
  // returns
  transformReturn,
  transformReturnList,
  transformPagedReturns,
  // errors
  transformEngineError,
  // status maps (exported for service-layer use)
  STATUS_FROM_ENGINE,
  STATUS_TO_ENGINE,
  MOVEMENT_TYPE_FROM_ENGINE,
  INSPECTION_STATUS_FROM_ENGINE,
  INSPECTION_STATUS_TO_ENGINE,
};
