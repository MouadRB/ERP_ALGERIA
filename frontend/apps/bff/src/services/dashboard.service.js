// ─────────────────────────────────────────────────────────────────────────────
// Dashboard service — engine-b is the source of truth.
//
// The engine-b dashboard module already aggregates KPIs, the confirmation
// queue, the COD funnel, and the risk-score donut from the order data it
// pulls live from engine-a. The BFF used to recompute all of that locally
// against mock data — this module replaces those mocks with thin wrappers
// over `/api/dashboard/*` plus a per-user TTL cache and post-mutation
// invalidation so the UI never reads a stale aggregation.
// ─────────────────────────────────────────────────────────────────────────────

const engineB = require('./engine-b.client');
const cache   = require('./dashboard.cache');
const T       = require('../transformers/dashboard.transformer');
const { AppError } = require('../errors/AppError');

const ctxFrom = (req) => ({ req, user: req?.user });
const userId  = (req) => req?.user?.id ?? 'service';

// ─── Reads ──────────────────────────────────────────────────────────────────

const getDashboardSummary = async (req) => {
  const cached = cache.get(userId(req), cache.SCOPES.SUMMARY);
  if (cached) return cached;

  let data;
  let degraded = false;
  const errors = [];
  try {
    ({ data } = await engineB.get('/api/dashboard', { ctx: ctxFrom(req) }));
  } catch (err) {
    degraded = true;
    errors.push({ source: 'engine-b', message: err?.message ?? 'unknown' });
  }

  const summary = data ? T.transformDashboardSummary(data) : {
    stats: null, confirmations: null, codFunnel: null, riskScore: null,
  };

  // The frontend contract (apps/web/modules/dashboard/types.ts:RawDashboardDTO)
  // still carries crmActivity / inventoryAlerts / procurement. They were part
  // of the old BFF-side cross-module mock dashboard and are not exposed by
  // engine-b's dashboard module — leaving them null keeps the contract stable
  // without resurrecting the mocks.
  const payload = {
    generatedAt:     new Date().toISOString(),
    stats:           summary.stats,
    confirmations:   summary.confirmations,
    codFunnel:       summary.codFunnel,
    riskScore:       summary.riskScore,
    crmActivity:     null,
    inventoryAlerts: null,
    procurement:     null,
    degraded,
    sources:         { 'engine-b': degraded ? 'down' : 'ok' },
    ...(errors.length > 0 ? { errors } : {}),
  };

  // Cross-populate every sub-scope from the same upstream snapshot so a
  // follow-up `/kpis` / `/confirmation-queue` call returns numbers that
  // match the full payload — engine-b recomputes on each call, so without
  // this the per-endpoint caches could drift inside the TTL window.
  const uid = userId(req);
  if (!degraded) {
    cache.set(uid, cache.SCOPES.KPIS,               summary.stats);
    cache.set(uid, cache.SCOPES.CONFIRMATION_QUEUE, summary.confirmations);
    cache.set(uid, cache.SCOPES.COD_FUNNEL,         summary.codFunnel);
    cache.set(uid, cache.SCOPES.RISK_SCORE,         summary.riskScore);
  }
  return cache.set(uid, cache.SCOPES.SUMMARY, payload);
};

const getKpis = async (req) => {
  const cached = cache.get(userId(req), cache.SCOPES.KPIS);
  if (cached) return cached;

  const { data } = await engineB.get('/api/dashboard/kpis', { ctx: ctxFrom(req) });
  return cache.set(userId(req), cache.SCOPES.KPIS, T.transformKpis(data));
};

const getConfirmationQueue = async (req) => {
  const cached = cache.get(userId(req), cache.SCOPES.CONFIRMATION_QUEUE);
  if (cached) return cached;

  const { data } = await engineB.get('/api/dashboard/confirmation-queue', { ctx: ctxFrom(req) });
  return cache.set(
    userId(req),
    cache.SCOPES.CONFIRMATION_QUEUE,
    T.transformConfirmationQueue(data ?? []),
  );
};

const getCodFunnel = async (req) => {
  const cached = cache.get(userId(req), cache.SCOPES.COD_FUNNEL);
  if (cached) return cached;

  const { data } = await engineB.get('/api/dashboard/cod-funnel', { ctx: ctxFrom(req) });
  return cache.set(userId(req), cache.SCOPES.COD_FUNNEL, T.transformCodFunnel(data));
};

const getRiskScore = async (req) => {
  const cached = cache.get(userId(req), cache.SCOPES.RISK_SCORE);
  if (cached) return cached;

  const { data } = await engineB.get('/api/dashboard/risk-score', { ctx: ctxFrom(req) });
  return cache.set(userId(req), cache.SCOPES.RISK_SCORE, T.transformRiskScore(data));
};

// ─── Mutations ──────────────────────────────────────────────────────────────
// engine-b's DashboardController returns a bare `{ message: "..." }` on
// success, so we don't pass the body through the standard `success` envelope
// path of engine-b.client. We invalidate the *whole* per-user dashboard cache
// after every mutation — KPIs, queue, funnel and risk all shift, and getting
// any one wrong is more expensive than the extra refetch.

const confirmOrder = async (orderId, req) => {
  if (!orderId) {
    throw new AppError('VALIDATION', 'orderId requis.', 400, 'orderId');
  }
  await engineB.post(
    `/api/dashboard/orders/${encodeURIComponent(orderId)}/confirm`,
    undefined,
    { ctx: ctxFrom(req) },
  );
  // Dashboard aggregations (KPIs / queue / funnel / risk) are global, not
  // per-user — wipe every entry so a second user reading the dashboard
  // 1 second later doesn't still see the order in the queue.
  cache.invalidateAll();
  return { ok: true, orderId };
};

const confirmAllPending = async (req) => {
  const { data } = await engineB.post(
    '/api/dashboard/orders/confirm-all',
    undefined,
    { ctx: ctxFrom(req) },
  );
  cache.invalidateAll();
  // engine-b returns `{ message: "N order(s) confirmed." }`. Extract N for the
  // UI so we can render a toast without re-parsing on the client.
  const message = data?.message ?? '';
  const match   = /^(\d+)/.exec(String(message));
  const count   = match ? Number(match[1]) : null;
  return { ok: true, count, message };
};

module.exports = {
  getDashboardSummary,
  getKpis,
  getConfirmationQueue,
  getCodFunnel,
  getRiskScore,
  confirmOrder,
  confirmAllPending,
  // Re-exported for tests / future use
  _cache: cache,
};
