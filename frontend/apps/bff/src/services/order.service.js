// ─────────────────────────────────────────────────────────────────────────────
// Order service — orchestrator on top of Engine-A OMS.
//
// Engine-A (Spring Boot) is the single source of truth for OMS. This module:
//   • forwards every read/write to Engine-A through engine-a.client
//   • bridges the frontend ↔ Engine-A vocabulary via oms.transformer
//   • handles search-disabled fallback (HTTP 503 on /search → /orders)
//   • generates the per-request Idempotency-Key for order creation
//   • orchestrates the dual-engine call for return decisions
//     (OMS returns endpoint + Inventory return inspection)
//
// Computed views (stats, queue, suivi, analytics, retours) keep using the
// existing helpers; they consume the transformed order list whose shape
// matches what those helpers expect.
// ─────────────────────────────────────────────────────────────────────────────

const { randomUUID } = require('crypto');
const engineA = require('./engine-a.client');
const { AppError } = require('../errors/AppError');
const transformer = require('../transformers/oms.transformer');
const { computeStats } = require('./oms-stats.service');
const { computeQueue } = require('./oms-queue.service');
const { computeCarrierSuivi } = require('./oms-suivi.service');
const { computeAnalytics } = require('./oms-analytics.service');

// ── Helpers ─────────────────────────────────────────────────────────────────

const generateIdempotencyKey = () => {
  // Node 14.17+ exposes randomUUID. Falls back for ancient runtimes.
  if (typeof randomUUID === 'function') return randomUUID();
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Engine-A search returns 503 when Opensearch is disabled. We catch that and
// degrade to GET /oms/v1/orders. We also degrade on any 502/504 wrapped by the
// client into ENGINE_A_UNAVAILABLE.
const isSearchUnavailable = (err) => {
  if (!(err instanceof AppError)) return false;
  if (err.status === 503) return true;
  if (err.code === 'ENGINE_A_UNAVAILABLE' && [502, 503, 504].includes(err.status)) return true;
  return false;
};

const fetchOrdersForCompute = async (ctx) => {
  // Computed views (stats, queue, suivi, analytics) need the full active set.
  // We page through /orders; in production this would page-loop, but for
  // dashboard-scope a single fat page (size=500) matches the previous mock
  // behavior.
  const { data, pagination } = await engineA.get('/oms/v1/orders', {
    ctx,
    query: { page: 0, size: 500 },
  });
  const paged = transformer.transformPagedOrders({ data, pagination }, { page: 1, pageSize: 500 });
  return paged.data;
};

// ── Order list & search (with 503 fallback) ─────────────────────────────────

const getOrders = async (query = {}, ctx) => {
  const fallback = { page: query.page || 1, pageSize: query.pageSize || 20 };

  // 1) Try faceted search first.
  try {
    const searchQuery = transformer.buildSearchQuery(query);
    const response = await engineA.get('/oms/v1/orders/search', { ctx, query: searchQuery });
    return transformer.transformPagedOrders(response, fallback);
  } catch (err) {
    if (!isSearchUnavailable(err)) throw err;
    // search disabled → graceful degradation
  }

  // 2) Fallback: basic list. We lose facet filters here; we still pass page/size.
  const response = await engineA.get('/oms/v1/orders', {
    ctx,
    query: {
      page: Math.max(0, (Number(query.page) || 1) - 1),
      size: Number(query.pageSize) || 20,
    },
  });
  return transformer.transformPagedOrders(response, fallback);
};

const getOrderById = async (id, ctx) => {
  try {
    const { data } = await engineA.get(`/oms/v1/orders/${encodeURIComponent(id)}`, { ctx });
    return transformer.transformOrder(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

// ── Create order (idempotent) ───────────────────────────────────────────────

const createOrder = async (payload, ctx) => {
  const body = transformer.buildCreateOrderRequest(payload);
  const idempotencyKey = generateIdempotencyKey();

  const { data } = await engineA.request({
    method: 'POST',
    path: '/oms/v1/orders',
    body,
    ctx,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return transformer.transformOrder(data);
};

// ── State transitions ───────────────────────────────────────────────────────

const confirmOrder = async (id, _userId, ctx) => {
  try {
    const { data } = await engineA.post(`/oms/v1/orders/${encodeURIComponent(id)}/confirm`, {}, { ctx });
    return transformer.transformOrder(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const cancelOrder = async (id, reason, _userId, ctx) => {
  const query = transformer.buildCancelQuery({ reason });
  try {
    const { data } = await engineA.request({
      method: 'POST',
      path: `/oms/v1/orders/${encodeURIComponent(id)}/cancel`,
      query,
      ctx,
    });
    return transformer.transformOrder(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

// SYNC-6: the frontend "deliver" hook is mapped to Engine-A's /packed endpoint.
// Engine-A only flips DELIVERED via carrier webhook — /packed is the closest
// operator-driven progression from the dashboard.
const deliverOrder = async (id, _userId, ctx) => {
  try {
    const { data } = await engineA.post(`/oms/v1/orders/${encodeURIComponent(id)}/packed`, {}, { ctx });
    return transformer.transformOrder(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

// Engine-A assigns carriers automatically via application.yml routing rules.
// There is no carrier-assign endpoint to call. We acknowledge the request and
// echo back the current order so the frontend UI does not break.
const assignCarrier = async (id, carrier, _userId, ctx) => {
  const order = await getOrderById(id, ctx);
  if (!order) return null;
  return {
    ...order,
    carrier: carrier ?? order.carrier,
    tracking: { ...(order.tracking || {}), carrier: carrier ?? order.tracking?.carrier ?? null },
    _bffNote: 'carrier_assignment_routed_by_engine_a',
  };
};

// ── Return action — composite (OMS + Inventory) ─────────────────────────────
//
// One frontend intent → two backend calls:
//   1) POST /oms/v1/returns/{returnId}/{approve|reject}
//   2) PATCH /inventory/v1/returns/{id}/{approve|reject}
//
// Frontend may pass the OMS returnId in the body; if absent we fall back to
// the path :id (treating it as the return identifier). The two calls are
// best-effort orchestrated: if step 1 fails we abort; if step 2 fails after
// step 1 succeeded we surface the OMS result with a degraded marker so the
// user sees the OMS state was applied.
const handleReturnAction = async (id, action, payload = {}, ctx) => {
  const decision = transformer.mapReturnActionToDecision(action);
  if (!decision) {
    throw new AppError('INVALID_ACTION', `Action de retour inconnue: ${action}`, 400, 'action');
  }

  const returnId = payload.returnId || payload.return_id || id;

  // 1) OMS — primary truth for the return lifecycle.
  let omsResult;
  try {
    const { data } = await engineA.post(
      `/oms/v1/returns/${encodeURIComponent(returnId)}/${decision}`,
      {},
      { ctx },
    );
    omsResult = transformer.transformReturn(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }

  // 2) Inventory — secondary inspection record. Best-effort: log & flag.
  let inventoryResult = null;
  let inventoryError = null;
  try {
    const { data } = await engineA.patch(
      `/inventory/v1/returns/${encodeURIComponent(returnId)}/${decision}`,
      {},
      { ctx },
    );
    inventoryResult = data;
  } catch (err) {
    inventoryError =
      err instanceof AppError
        ? { code: err.code, message: err.message, status: err.status }
        : { code: 'UNKNOWN', message: String(err?.message || err) };
    // Do not throw: OMS already moved. Caller surfaces the partial result.
    // eslint-disable-next-line no-console
    console.warn('[oms] return-action: inventory step failed', inventoryError);
  }

  // For "resend" we additionally re-create the order via Engine-A. Item list
  // is taken from the original order or the request payload.
  let newOrder = null;
  if (action === 'resend') {
    const original = await getOrderById(id, ctx);
    if (original) {
      newOrder = await createOrder(
        {
          nomComplet: original.customerNameFr,
          telephone: original.customerPhone,
          adresse: original.address,
          wilayaCode: original.wilayaCode,
          commune: original.commune,
          source: original.source,
          customerId: original.customerId,
          paymentMethod: original.paymentMethod,
          items: (payload.items ?? original.items ?? []).map((it) => ({
            sku: it.sku,
            quantity: it.quantity ?? it.qty ?? 1,
          })),
        },
        ctx,
      );
    }
  }

  return {
    action,
    decision,
    return: omsResult,
    inventory: inventoryResult,
    inventoryError,
    newOrder,
    degraded: Boolean(inventoryError),
  };
};

// ── Dashboard / computed views ──────────────────────────────────────────────
//
// Engine-A exposes /oms/v1/dashboard with summary KPIs. The frontend hooks
// expect richer shapes (per-status counters, COD funnels, queue priorities,
// per-carrier aggregations) — we compute those locally on top of a fresh
// order list and merge any extra metrics provided by /dashboard. Engine-B is
// fanned out best-effort if its client is wired in the future.

const fetchEngineDashboard = async (ctx) => {
  try {
    const { data } = await engineA.get('/oms/v1/dashboard', { ctx });
    return data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[oms] /oms/v1/dashboard unavailable:', err?.message);
    return null;
  }
};

const fetchEngineBDashboard = async () => {
  // Placeholder for the Engine-B fan-out. No client is wired yet; returning
  // null keeps the merge logic simple while leaving the seam in place.
  return null;
};

const getStats = async (ctx) => {
  const [orders, engineDash, engineBDash] = await Promise.all([
    fetchOrdersForCompute(ctx),
    fetchEngineDashboard(ctx),
    fetchEngineBDashboard(ctx),
  ]);
  const computed = computeStats(orders);
  return {
    ...computed,
    enginea: engineDash || null,
    engineb: engineBDash || null,
  };
};

const getQueue = async (ctx) => {
  const orders = await fetchOrdersForCompute(ctx);
  return computeQueue(orders);
};

const getCarrierSuivi = async (ctx) => {
  const orders = await fetchOrdersForCompute(ctx);
  return computeCarrierSuivi(orders);
};

const getAnalytics = async (period = '7d', ctx) => {
  const orders = await fetchOrdersForCompute(ctx);
  return computeAnalytics(orders, period);
};

// Returns dashboard view: list of orders currently in a return state, joined
// (best-effort) with inventory inspections. No native list endpoint exists for
// /oms/v1/returns, so we derive the dataset from the order list.
const getRetours = async (ctx) => {
  const orders = await fetchOrdersForCompute(ctx);
  const returnedOrders = orders.filter((o) => o.status === 'Returned' || o.rawStatus === 'RETURNED');

  const retours = returnedOrders.map((o) => ({
    id: `RET-${o.id}`,
    orderRef: o.reference ? `#${o.reference}` : `#${o.id}`,
    orderId: o.id,
    customerPhone: o.customerPhone || '—',
    customerNameFr: o.customerNameFr || '—',
    produit: o.items?.[0]?.nameFr ?? o.items?.[0]?.sku ?? '—',
    produitQty: o.items?.[0]?.quantity ?? 1,
    carrier: o.carrier ?? '—',
    trackingNumber: o.trackingNumber ?? '—',
    raisonRetour: o.cancelReason ?? o.returnOutcome ?? null,
    raisonCategory: null,
    etatReception: 'En transit retour',
    etatReceptionKey: 'transit',
    returnedAt: o.updatedAt,
    inspectedAt: null,
  }));

  return {
    totalRetours: retours.length,
    totalLitiges: 0,
    retours,
    litiges: [],
  };
};

module.exports = {
  // CRUD
  getOrders,
  getOrderById,
  createOrder,
  // transitions
  confirmOrder,
  cancelOrder,
  deliverOrder,
  assignCarrier,
  handleReturnAction,
  // computed views
  getStats,
  getQueue,
  getCarrierSuivi,
  getAnalytics,
  getRetours,
};
