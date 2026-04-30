// ─────────────────────────────────────────────────────────────────────────────
// Inventory service — orchestrator on top of Engine-A.
//
// Engine-A (Spring Boot) is the SINGLE source of truth for inventory.
// This module:
//   • forwards every read/write to Engine-A through engine-a.client
//   • normalizes Engine-A DTOs via inventory.transformer
//   • resolves SKU → stockRecordId on demand (the frontend speaks SKUs,
//     Engine-A endpoints work with ids except for /by-sku/{skuCode})
//   • caches the dashboard for a short window
//   • joins PIM-owned fields (name, supplier, prices) through cross-module
//     helpers — Engine-A does not own those.
//
// No business logic lives here: things like FIFO consumption, reservation
// upgrades and quarantine accounting are computed by Engine-A.
// ─────────────────────────────────────────────────────────────────────────────

const engineA = require('./engine-a.client');
const { AppError } = require('../errors/AppError');
const transformer = require('../transformers/inventory.transformer');
const { enrichInventoryItemWithPIM } = require('./cross-module.helpers');

// ── Caches ──────────────────────────────────────────────────────────────────

const SKU_CACHE_TTL_MS = parseInt(process.env.INVENTORY_SKU_CACHE_TTL_MS ?? '60000', 10);
const DASHBOARD_CACHE_TTL_MS = parseInt(
  process.env.INVENTORY_DASHBOARD_CACHE_TTL_MS ?? '45000',
  10,
);

const skuToIdCache = new Map(); // sku → { id, expiresAt }
const stockRecordSnapshot = new Map(); // sku → snapshot (for cross-module sync helpers)
let dashboardCache = null; // { value, expiresAt }

const now = () => Date.now();

const cacheSku = (record) => {
  if (!record?.sku || !record?.stockRecordId) return;
  skuToIdCache.set(record.sku, {
    id: record.stockRecordId,
    expiresAt: now() + SKU_CACHE_TTL_MS,
  });
  stockRecordSnapshot.set(record.sku, record);
};

const cacheBatch = (records) => {
  (records || []).forEach(cacheSku);
};

const readSkuFromCache = (sku) => {
  const hit = skuToIdCache.get(sku);
  if (!hit) return null;
  if (hit.expiresAt < now()) {
    skuToIdCache.delete(sku);
    return null;
  }
  return hit.id;
};

// ── SKU → stockRecordId resolver ────────────────────────────────────────────

const resolveStockRecordId = async (sku, ctx) => {
  if (!sku) {
    throw new AppError('VALIDATION_ERROR', 'SKU manquant.', 400, 'sku');
  }
  const cached = readSkuFromCache(sku);
  if (cached) return cached;

  const { data } = await engineA.get(
    `/inventory/v1/stock-records/by-sku/${encodeURIComponent(sku)}`,
    { ctx },
  );
  const record = transformer.transformStockRecord(data);
  if (!record?.stockRecordId) {
    throw new AppError('NOT_FOUND', `SKU introuvable: ${sku}`, 404, 'sku');
  }
  cacheSku(record);
  return record.stockRecordId;
};

const enrichWithPIM = (record) => {
  if (!record) return record;
  const pim = enrichInventoryItemWithPIM(record);
  return {
    ...pim,
    quantityOnHand: record.quantityOnHand,
    quantityAvailable: record.quantityAvailable,
    quantityReserved: record.quantityReserved,
    softReserved: record.softReserved,
    hardReserved: record.hardReserved,
    quantityQuarantined: record.quantityQuarantined,
    reorderPoint: record.reorderPoint,
    reorderQuantity: record.reorderQuantity,
    stockStatus: record.stockStatus,
    costFifo: record.costFifo || pim.costFifo || 0,
    weightedAverageCost: record.weightedAverageCost,
    stockValue: record.stockValue,
    availableValue:
      (record.quantityAvailable || 0) * (record.costFifo || pim.costFifo || 0),
    stockRecordId: record.stockRecordId,
    productId: record.productId || pim.productId,
    variantId: record.variantId,
    lastMovementAt: record.lastMovementAt,
  };
};

// ── Stock list / detail ─────────────────────────────────────────────────────

const getStock = async (
  { page = 1, pageSize = 20, search, stockStatus, sort } = {},
  ctx,
) => {
  const query = {
    page: Math.max(0, page - 1),
    size: pageSize,
    search: search || undefined,
    status: transformer.STATUS_TO_ENGINE[stockStatus] || undefined,
    sort: sort || undefined,
  };

  const response = await engineA.get('/inventory/v1/stock-records', { ctx, query });
  const paged = transformer.transformPagedStockRecords(response, { page, pageSize });
  cacheBatch(paged.data);

  return {
    data: paged.data.map(enrichWithPIM),
    meta: paged.meta,
  };
};

const getStockBySKU = async (sku, ctx) => {
  const { data } = await engineA.get(
    `/inventory/v1/stock-records/by-sku/${encodeURIComponent(sku)}`,
    { ctx },
  );
  const record = transformer.transformStockRecord(data);
  if (!record) return null;
  cacheSku(record);
  return enrichWithPIM(record);
};

const getStockById = async (id, ctx) => {
  const { data } = await engineA.get(
    `/inventory/v1/stock-records/${encodeURIComponent(id)}`,
    { ctx },
  );
  const record = transformer.transformStockRecord(data);
  if (!record) return null;
  cacheSku(record);
  return enrichWithPIM(record);
};

// ── Stock evolution ─────────────────────────────────────────────────────────

const getStockEvolution = async (sku, ctx) => {
  const id = await resolveStockRecordId(sku, ctx);
  const { data } = await engineA.get(
    `/inventory/v1/stock-records/${encodeURIComponent(id)}/evolution`,
    { ctx },
  );
  return transformer.transformEvolution(data);
};

// ── Movements ───────────────────────────────────────────────────────────────

const getMovements = async ({ sku, page = 1, pageSize = 50 } = {}, ctx) => {
  if (!sku) {
    const { data, pagination } = await engineA.get(
      '/inventory/v1/movements/audit-journal',
      { ctx, query: { page: page - 1, size: pageSize } },
    );
    const paged = transformer.transformPagedMovements({ data, pagination }, { page, pageSize });
    return paged.data;
  }

  const id = await resolveStockRecordId(sku, ctx);
  const { data, pagination } = await engineA.get(
    `/inventory/v1/movements/by-stock-record/${encodeURIComponent(id)}`,
    { ctx, query: { page: page - 1, size: pageSize } },
  );
  const paged = transformer.transformPagedMovements({ data, pagination }, { page, pageSize });
  return paged.data;
};

const getAuditJournal = async ({ type, page = 1, pageSize = 50 } = {}, ctx) => {
  const { data, pagination } = await engineA.get(
    '/inventory/v1/movements/audit-journal',
    { ctx, query: { type, page: page - 1, size: pageSize } },
  );
  return transformer.transformPagedMovements({ data, pagination }, { page, pageSize });
};

// ── FIFO ────────────────────────────────────────────────────────────────────

const getFifoLayers = async (sku, ctx) => {
  const id = await resolveStockRecordId(sku, ctx);
  const [layersResponse, summaryResponse] = await Promise.all([
    engineA.get(`/inventory/v1/fifo-layers/by-stock-record/${encodeURIComponent(id)}`, { ctx }),
    engineA.get(`/inventory/v1/fifo-layers/summary/${encodeURIComponent(id)}`, { ctx }),
  ]);
  return {
    layers: transformer.transformFifoLayers(layersResponse.data),
    summary: transformer.transformFifoSummary(summaryResponse.data),
  };
};

// ── Dashboard (cached) ──────────────────────────────────────────────────────

const getStats = async (ctx) => {
  if (dashboardCache && dashboardCache.expiresAt > now()) {
    return dashboardCache.value;
  }
  const { data } = await engineA.get('/inventory/v1/dashboard', { ctx });
  const value = transformer.transformDashboard(data);
  dashboardCache = { value, expiresAt: now() + DASHBOARD_CACHE_TTL_MS };
  return value;
};

const invalidateDashboard = () => {
  dashboardCache = null;
};

// ── Alerts ──────────────────────────────────────────────────────────────────

const getAlerts = async (ctx) => {
  const { data } = await engineA.get('/inventory/v1/alerts', { ctx });
  return transformer.transformAlertList(data);
};

const getReorderSuggestions = async (ctx) => {
  const { data } = await engineA.get('/inventory/v1/alerts/reorder-suggestions', { ctx });
  return transformer.transformAlertList(data);
};

const resolveAlert = async (alertId, ctx) => {
  const { data } = await engineA.patch(
    `/inventory/v1/alerts/${encodeURIComponent(alertId)}/resolve`,
    {},
    { ctx },
  );
  invalidateDashboard();
  return transformer.transformAlert(data);
};

// ── Threshold ───────────────────────────────────────────────────────────────

const updateThreshold = async (sku, { reorderThreshold, reorderQuantity }, ctx) => {
  const id = await resolveStockRecordId(sku, ctx);
  const { data } = await engineA.patch(
    `/inventory/v1/stock-records/${encodeURIComponent(id)}/threshold`,
    { reorderThreshold, reorderQuantity },
    { ctx },
  );
  invalidateDashboard();
  const record = transformer.transformStockRecord(data);
  cacheSku(record);
  return enrichWithPIM(record);
};

// ── Movement creation ───────────────────────────────────────────────────────
//
// The frontend speaks of business movement types. Engine-A exposes specialized
// endpoints. We map intent → endpoint here. No business logic is duplicated:
// Engine-A still performs FIFO accounting, threshold re-evaluation, etc.
//
//   receipt           → POST /stock-records/{id}/receive
//   adjustment*       → POST /stock-records/{id}/adjust  (sign on quantityChange)
//   sale / return /   → POST /stock-records/{id}/adjust  with explicit reason
//   physicalInventory   (Engine-A has no first-class endpoint for these MVP types)
//   quarantine        → POST /stock-records/{id}/adjust  with reason=QUARANTINE
//   bulk              → POST /movements/bulk
// ─────────────────────────────────────────────────────────────────────────────

const ADJUSTMENT_REASONS = {
  sale: 'SALE',
  return: 'RETURN',
  quarantine: 'QUARANTINE',
  physicalInventory: 'PHYSICAL_INVENTORY',
  adjustment: 'ADJUSTMENT',
};

const createMovement = async (
  { sku, type, quantity, reason, unitCostHT, referenceId, purchaseOrderRef, supplierCode } = {},
  ctx,
) => {
  if (!sku) throw new AppError('VALIDATION_ERROR', 'SKU manquant.', 400, 'sku');
  const numericQty = Number(quantity);
  if (!Number.isFinite(numericQty) || numericQty === 0) {
    throw new AppError('INVALID_QUANTITY', 'La quantité doit être différente de zéro.', 400, 'quantity');
  }

  const id = await resolveStockRecordId(sku, ctx);
  let response;

  switch (type) {
    case 'receipt': {
      const cost = Number(unitCostHT);
      if (!Number.isFinite(cost) || cost <= 0) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Le coût unitaire est requis pour une réception.',
          400,
          'unitCostHT',
        );
      }
      response = await engineA.post(
        `/inventory/v1/stock-records/${encodeURIComponent(id)}/receive`,
        {
          stockRecordId: id,
          purchaseOrderRef: purchaseOrderRef || referenceId || `BFF-${Date.now()}`,
          supplierCode: supplierCode || null,
          quantity: Math.abs(numericQty),
          unitCost: cost,
        },
        { ctx },
      );
      break;
    }
    case 'sale':
    case 'return':
    case 'quarantine':
    case 'physicalInventory':
    case 'adjustment': {
      const sign = type === 'sale' || type === 'quarantine' ? -1 : 1;
      const quantityChange =
        type === 'adjustment' ? Math.trunc(numericQty) : sign * Math.abs(Math.trunc(numericQty));
      response = await engineA.post(
        `/inventory/v1/stock-records/${encodeURIComponent(id)}/adjust`,
        {
          quantityChange,
          reason: reason || ADJUSTMENT_REASONS[type],
        },
        { ctx },
      );
      break;
    }
    default:
      throw new AppError(
        'INVALID_TYPE',
        `Type de mouvement non supporté: ${type}`,
        400,
        'type',
      );
  }

  invalidateDashboard();
  const record = transformer.transformStockRecord(response.data);
  cacheSku(record);
  return enrichWithPIM(record);
};

const quarantineStock = async ({ sku, quantity, reason }, ctx) =>
  createMovement(
    {
      sku,
      type: 'quarantine',
      quantity: Math.abs(Number(quantity)),
      reason: reason || 'QUARANTINE',
    },
    ctx,
  );

const bulkMovement = async (
  { stockRecordIds, movementType, quantity, purchaseOrderRef, supplierCode, unitCost, reason } = {},
  ctx,
) => {
  await engineA.post(
    '/inventory/v1/movements/bulk',
    {
      stockRecordIds,
      movementType,
      quantity,
      purchaseOrderRef: purchaseOrderRef || null,
      supplierCode: supplierCode || null,
      unitCost: unitCost ?? null,
      reason: reason || null,
    },
    { ctx },
  );
  invalidateDashboard();
  return { ok: true };
};

// ── Reservations (OMS sync) ─────────────────────────────────────────────────
//
// Reservations are the synchronization channel between OMS and Inventory.
// OMS calls these BFF endpoints during order lifecycle transitions; Engine-A
// then performs the soft/hard accounting against FIFO stock.

const createSoftReservation = async ({ sku, orderId, clientRef, quantity, omsStatus }, ctx) => {
  const { data } = await engineA.post(
    '/inventory/v1/reservations/soft',
    { skuCode: sku, orderId, clientRef: clientRef || null, quantity, omsStatus: omsStatus || null },
    { ctx },
  );
  invalidateDashboard();
  return transformer.transformReservation(data);
};

const upgradeReservation = async (reservationId, ctx) => {
  const { data } = await engineA.patch(
    `/inventory/v1/reservations/${encodeURIComponent(reservationId)}/upgrade`,
    {},
    { ctx },
  );
  invalidateDashboard();
  return transformer.transformReservation(data);
};

const releaseReservation = async (reservationId, ctx) => {
  await engineA.patch(
    `/inventory/v1/reservations/${encodeURIComponent(reservationId)}/release`,
    {},
    { ctx },
  );
  invalidateDashboard();
  return { ok: true };
};

const shipOrder = async (orderId, ctx) => {
  await engineA.post(
    `/inventory/v1/reservations/ship/${encodeURIComponent(orderId)}`,
    {},
    { ctx },
  );
  invalidateDashboard();
  return { ok: true };
};

const getReservationsByOrder = async (orderId, ctx) => {
  const { data } = await engineA.get(
    `/inventory/v1/reservations/by-order/${encodeURIComponent(orderId)}`,
    { ctx },
  );
  return transformer.transformReservationList(data);
};

const getReservationsByStockRecord = async (id, ctx) => {
  const { data } = await engineA.get(
    `/inventory/v1/reservations/by-stock-record/${encodeURIComponent(id)}`,
    { ctx },
  );
  return transformer.transformReservationList(data);
};

const getReservationsBySku = async (sku, ctx) => {
  const id = await resolveStockRecordId(sku, ctx);
  return getReservationsByStockRecord(id, ctx);
};

// ── Returns ─────────────────────────────────────────────────────────────────

const createReturn = async (
  { sku, orderId, customerRef, returnReason, productCondition, quantity },
  ctx,
) => {
  const { data } = await engineA.post(
    '/inventory/v1/returns',
    {
      skuCode: sku,
      orderId,
      customerRef: customerRef || null,
      returnReason,
      productCondition,
      quantity,
    },
    { ctx },
  );
  invalidateDashboard();
  return transformer.transformReturn(data);
};

const approveReturn = async (returnId, ctx) => {
  const { data } = await engineA.patch(
    `/inventory/v1/returns/${encodeURIComponent(returnId)}/approve`,
    {},
    { ctx },
  );
  invalidateDashboard();
  return transformer.transformReturn(data);
};

const rejectReturn = async (returnId, { rejectionReason, disposition } = {}, ctx) => {
  const { data } = await engineA.patch(
    `/inventory/v1/returns/${encodeURIComponent(returnId)}/reject`,
    {
      decision: 'REJECTED',
      rejectionReason: rejectionReason || null,
      disposition: disposition || null,
    },
    { ctx },
  );
  invalidateDashboard();
  return transformer.transformReturn(data);
};

const listReturns = async ({ status, page = 1, pageSize = 20 } = {}, ctx) => {
  const engineStatus =
    transformer.INSPECTION_STATUS_TO_ENGINE[status] || (status ? status.toUpperCase() : undefined);
  const response = await engineA.get('/inventory/v1/returns', {
    ctx,
    query: { status: engineStatus, page: page - 1, size: pageSize },
  });
  return transformer.transformPagedReturns(response, { page, pageSize });
};

const getReturnById = async (returnId, ctx) => {
  const { data } = await engineA.get(
    `/inventory/v1/returns/${encodeURIComponent(returnId)}`,
    { ctx },
  );
  return transformer.transformReturn(data);
};

// Frontend convenience: a single endpoint that maps "approve" / "reject" decisions.
const processReturn = async ({ returnId, decision, rejectionReason, disposition } = {}, ctx) => {
  if (decision === 'approve') return approveReturn(returnId, ctx);
  if (decision === 'reject') return rejectReturn(returnId, { rejectionReason, disposition }, ctx);
  throw new AppError('INVALID_DECISION', `Décision inconnue: ${decision}`, 400, 'decision');
};

// ── Cross-module helpers (sync) ─────────────────────────────────────────────
//
// PIM, catalogue and rapports adapters call this synchronously inside `.map()`
// chains. They do not have a request context. We serve them from the snapshot
// that the most recent Engine-A read has populated. If the snapshot is empty
// (e.g. first request to a fresh BFF), callers handle null gracefully.
const getStockForProduct = ({ sku, productId } = {}) => {
  if (sku && stockRecordSnapshot.has(sku)) return stockRecordSnapshot.get(sku);
  if (productId) {
    for (const record of stockRecordSnapshot.values()) {
      if (record.productId === productId) return record;
    }
  }
  return null;
};

const getStockForProductAsync = async ({ sku, productId } = {}, ctx) => {
  if (sku) {
    try {
      return await getStockBySKU(sku, ctx);
    } catch (err) {
      if (err instanceof AppError && err.status === 404) return null;
      throw err;
    }
  }
  if (productId && stockRecordSnapshot.size > 0) {
    for (const record of stockRecordSnapshot.values()) {
      if (record.productId === productId) return record;
    }
  }
  return null;
};

// ── Public API ──────────────────────────────────────────────────────────────

module.exports = {
  // resolution
  resolveStockRecordId,
  // stock
  getStock,
  getStockBySKU,
  getStockById,
  getStockEvolution,
  updateThreshold,
  // movements
  getMovements,
  getAuditJournal,
  createMovement,
  quarantineStock,
  bulkMovement,
  // fifo
  getFifoLayers,
  // dashboard / alerts
  getStats,
  getAlerts,
  getReorderSuggestions,
  resolveAlert,
  invalidateDashboard,
  // reservations
  createSoftReservation,
  upgradeReservation,
  releaseReservation,
  shipOrder,
  getReservationsByOrder,
  getReservationsByStockRecord,
  getReservationsBySku,
  // returns
  createReturn,
  approveReturn,
  rejectReturn,
  listReturns,
  getReturnById,
  processReturn,
  // cross-module
  getStockForProduct,
  getStockForProductAsync,
};
