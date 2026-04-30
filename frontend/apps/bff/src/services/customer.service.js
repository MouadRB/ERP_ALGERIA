// ─────────────────────────────────────────────────────────────────────────────
// Customer service — orchestrator on top of Engine-B CRM.
//
// Engine-B is the SINGLE source of truth for customers, blacklist, risk, and
// CRM analytics. This module:
//   • forwards every read/write to Engine-B through engine-b.client
//   • bridges the frontend ↔ Engine-B vocabulary via crm.transformer
//   • orders/risk-profile/interactions are READ from Engine-B — we do not
//     fan out to Engine-A here, the spec is explicit about that.
//
// All previous mock branches have been removed.
// ─────────────────────────────────────────────────────────────────────────────

const engineB = require('./engine-b.client');
const t       = require('../transformers/crm.transformer');
const { AppError } = require('../errors/AppError');

const BASE = '/api/crm';

const buildCtx = (req) => ({ req });

// ── Customers — CRUD ───────────────────────────────────────────────────────

const listCustomers = async (query = {}, ctx) => {
  const fallback = { page: query.page || 1, pageSize: query.pageSize || 20 };
  const response = await engineB.get(`${BASE}/customers`, {
    ctx,
    query: t.buildCustomerListQuery(query),
  });
  return t.transformPagedCustomers(response, fallback);
};

const getCustomer = async (id, ctx) => {
  try {
    const { data } = await engineB.get(`${BASE}/customers/${encodeURIComponent(id)}`, { ctx });
    return t.transformCustomer(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const getCustomerDetail = async (id, ctx) => {
  try {
    const { data } = await engineB.get(
      `${BASE}/customers/${encodeURIComponent(id)}/detail`,
      { ctx },
    );
    return t.transformCustomer(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const createCustomer = async (payload, ctx) => {
  const { data } = await engineB.post(
    `${BASE}/customers`,
    t.buildCreateCustomerRequest(payload),
    { ctx },
  );
  return t.transformCustomer(data);
};

const updateCustomer = async (id, payload, ctx) => {
  try {
    const { data } = await engineB.put(
      `${BASE}/customers/${encodeURIComponent(id)}`,
      t.buildUpdateCustomerRequest(payload),
      { ctx },
    );
    return t.transformCustomer(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const deleteCustomer = async (id, ctx) => {
  try {
    await engineB.del(`${BASE}/customers/${encodeURIComponent(id)}`, { ctx });
    return true;
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return false;
    throw err;
  }
};

// ── Phone lookup ───────────────────────────────────────────────────────────

const phoneLookup = async (phone, ctx) => {
  try {
    const { data } = await engineB.get(`${BASE}/customers/lookup`, {
      ctx,
      query: { phone },
    });
    return t.transformCustomer(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

// ── Blacklist ──────────────────────────────────────────────────────────────

const listBlacklist = async (query = {}, ctx) => {
  const fallback = { page: query.page || 1, pageSize: query.pageSize || 50 };
  const response = await engineB.get(`${BASE}/customers/blacklist`, {
    ctx,
    query: { page: query.page, pageSize: query.pageSize, search: query.search },
  });
  return t.transformPagedCustomers(response, fallback);
};

// Engine-B blacklist endpoints return Ok() (empty body). Re-fetch the
// customer so the BFF surface stays { data: customer }.
const addToBlacklist = async (id, payload, ctx) => {
  try {
    await engineB.post(
      `${BASE}/customers/${encodeURIComponent(id)}/blacklist`,
      t.buildBlacklistRequest(payload),
      { ctx },
    );
    return await getCustomer(id, ctx);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const removeFromBlacklist = async (id, ctx) => {
  try {
    await engineB.del(
      `${BASE}/customers/${encodeURIComponent(id)}/blacklist`,
      { ctx },
    );
    return await getCustomer(id, ctx);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

// ── Merge (pass-through — Engine-B owns merge semantics) ───────────────────

// Engine-B merge deletes the URL id and keeps body.targetCustomerId, so we
// re-fetch the SURVIVOR (target), not the source — otherwise the frontend
// gets `{ data: null }` because engine-b just removed `id`.
const mergeCustomer = async (id, payload, ctx) => {
  const body = t.buildMergeRequest(payload);
  await engineB.post(
    `${BASE}/customers/${encodeURIComponent(id)}/merge`,
    body,
    { ctx },
  );
  const survivorId = body?.targetCustomerId;
  return survivorId ? await getCustomer(survivorId, ctx) : null;
};

// ── Cross-domain (Engine-B already aggregates OMS data — DO NOT call Engine-A) ──

const getCustomerOrders = async (id, query = {}, ctx) => {
  const fallback = { page: query.page || 1, pageSize: query.pageSize || 20 };
  const { data, pagination } = await engineB.get(
    `${BASE}/customers/${encodeURIComponent(id)}/orders`,
    {
      ctx,
      query: { page: query.page, pageSize: query.pageSize, status: query.status },
    },
  );
  const rows = Array.isArray(data) ? data : data?.items ?? data?.content ?? [];
  // Engine-B returns a bare List<Order> with no envelope, so synthesize
  // pagination from the row count to keep the BFF surface consistent with
  // the paged customer / ticket endpoints.
  const meta = pagination
    ? t.transformPagination(pagination, fallback)
    : Array.isArray(data)
      ? t.transformPagination(
          { total: rows.length, page: fallback.page, pageSize: rows.length || fallback.pageSize },
          fallback,
        )
      : t.transformPagination(data, fallback);
  return { data: rows, meta };
};

const getRiskProfile = async (id, ctx) => {
  try {
    const { data } = await engineB.get(
      `${BASE}/customers/${encodeURIComponent(id)}/risk-profile`,
      { ctx },
    );
    return data;
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

// ── Interactions ───────────────────────────────────────────────────────────

const listInteractions = async (id, query = {}, ctx) => {
  const fallback = { page: query.page || 1, pageSize: query.pageSize || 20 };
  const response = await engineB.get(
    `${BASE}/customers/${encodeURIComponent(id)}/interactions`,
    {
      ctx,
      query: { page: query.page, pageSize: query.pageSize, type: query.type },
    },
  );
  return t.transformPagedInteractions(response, fallback);
};

const addInteraction = async (id, payload, ctx) => {
  const { data } = await engineB.post(
    `${BASE}/customers/${encodeURIComponent(id)}/interactions`,
    t.buildInteractionRequest(id, payload, ctx?.req?.user),
    { ctx },
  );
  return t.transformInteraction(data);
};

// ── CRM analytics & metadata ───────────────────────────────────────────────

const getStats = async (ctx) => {
  const { data } = await engineB.get(`${BASE}/stats`, { ctx });
  return data;
};

const getAnalytics = async (period, ctx) => {
  const { data } = await engineB.get(`${BASE}/analytics`, {
    ctx,
    query: period ? { period } : undefined,
  });
  return data;
};

const getFiltersMetadata = async (ctx) => {
  const { data } = await engineB.get(`${BASE}/filters/metadata`, { ctx });
  return data;
};

module.exports = {
  buildCtx,
  // CRUD
  listCustomers,
  getCustomer,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  // lookup
  phoneLookup,
  // blacklist
  listBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  // merge
  mergeCustomer,
  // cross-domain reads
  getCustomerOrders,
  getRiskProfile,
  // interactions
  listInteractions,
  addInteraction,
  // analytics
  getStats,
  getAnalytics,
  getFiltersMetadata,
};
