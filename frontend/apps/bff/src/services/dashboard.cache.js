// ─────────────────────────────────────────────────────────────────────────────
// Dashboard cache.
//
// engine-b's `/api/dashboard/*` payloads are aggregations: each call walks the
// full order list and recomputes KPIs / queue / funnel / risk. Without a small
// in-memory cache the BFF re-fetches everything on every page render — a
// 5-call burst from the dashboard UI becomes 5× the load.
//
// Rules (per spec):
//   • TTL: short — 30s default. Tunable via DASHBOARD_CACHE_TTL_MS.
//   • Per-user keys, so a SuperAdmin and a LogisticsAgent never see each
//     other's data even if upstream filtering ever becomes role-aware.
//   • Hard invalidation after every mutation (`confirm` / `confirm-all`)
//     so the UI cannot read stale queue / KPIs / funnel after an action.
//
// Out of process the BFF doesn't share state, so this is a Map. If the BFF
// ever scales out we'd swap this for Redis; the API stays the same.
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TTL_MS = parseInt(process.env.DASHBOARD_CACHE_TTL_MS ?? '30000', 10);

const store = new Map(); // key → { value, expMs }

const now = () => Date.now();

const buildKey = (userId, scope) => `${userId ?? 'anon'}::${scope}`;

const get = (userId, scope) => {
  const key = buildKey(userId, scope);
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expMs <= now()) {
    store.delete(key);
    return null;
  }
  return hit.value;
};

const set = (userId, scope, value, ttlMs = DEFAULT_TTL_MS) => {
  const key = buildKey(userId, scope);
  store.set(key, { value, expMs: now() + ttlMs });
  return value;
};

/**
 * Wipe every dashboard cache entry for a single user.
 * Called immediately after a mutation so the next read forces a refetch.
 */
const invalidateUser = (userId) => {
  const prefix = `${userId ?? 'anon'}::`;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

/** Wipe every entry, every user. Used by tests and admin tools. */
const invalidateAll = () => store.clear();

const SCOPES = Object.freeze({
  SUMMARY:           'summary',
  KPIS:              'kpis',
  CONFIRMATION_QUEUE:'confirmation-queue',
  COD_FUNNEL:        'cod-funnel',
  RISK_SCORE:        'risk-score',
});

module.exports = {
  get,
  set,
  invalidateUser,
  invalidateAll,
  SCOPES,
  DEFAULT_TTL_MS,
};
