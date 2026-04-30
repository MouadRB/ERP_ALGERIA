// ─────────────────────────────────────────────────────────────────────────────
// CRM Tickets service — orchestrator on top of Engine-B.
//
// Engine-B is the source of truth for the ticket lifecycle (Open → InProgress
// → WaitingClient → Escalated → Resolved → Closed). The BFF translates the
// frontend's French labels into Engine-B's English enum, forwards the action
// (escalate / close / assign) and projects the response back. There are NO
// mock branches here.
// ─────────────────────────────────────────────────────────────────────────────

const engineB = require('./engine-b.client');
const t       = require('../transformers/crm.transformer');
const { AppError } = require('../errors/AppError');

const BASE = '/api/crm';

const listTickets = async (query = {}, ctx) => {
  const fallback = { page: query.page || 1, pageSize: query.pageSize || 20 };
  const response = await engineB.get(`${BASE}/tickets`, {
    ctx,
    query: t.buildTicketListQuery(query),
  });
  return t.transformPagedTickets(response, fallback);
};

const getTicketStats = async (ctx) => {
  const { data } = await engineB.get(`${BASE}/tickets/stats`, { ctx });
  return data;
};

const getTicket = async (id, ctx) => {
  try {
    const { data } = await engineB.get(
      `${BASE}/tickets/${encodeURIComponent(id)}`,
      { ctx },
    );
    return t.transformTicket(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const createTicket = async (payload, ctx) => {
  const { data } = await engineB.post(
    `${BASE}/tickets`,
    t.buildCreateTicketRequest(payload, ctx?.req?.user),
    { ctx },
  );
  return t.transformTicket(data);
};

const updateTicket = async (id, payload, ctx) => {
  try {
    const { data } = await engineB.put(
      `${BASE}/tickets/${encodeURIComponent(id)}`,
      t.buildUpdateTicketRequest(payload),
      { ctx },
    );
    return t.transformTicket(data);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const deleteTicket = async (id, ctx) => {
  try {
    await engineB.del(`${BASE}/tickets/${encodeURIComponent(id)}`, { ctx });
    return true;
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return false;
    throw err;
  }
};

// Engine-B ticket-action endpoints reply with `{ message }` not the ticket.
// Re-fetch after success so the frontend gets the up-to-date entity.
const escalateTicket = async (id, _payload, ctx) => {
  try {
    await engineB.post(
      `${BASE}/tickets/${encodeURIComponent(id)}/escalate`,
      t.buildEscalateTicketRequest(),
      { ctx },
    );
    return await getTicket(id, ctx);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const closeTicket = async (id, _payload, ctx) => {
  try {
    await engineB.post(
      `${BASE}/tickets/${encodeURIComponent(id)}/close`,
      t.buildCloseTicketRequest(),
      { ctx },
    );
    return await getTicket(id, ctx);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

const assignTicket = async (id, payload, ctx) => {
  try {
    await engineB.post(
      `${BASE}/tickets/${encodeURIComponent(id)}/assign`,
      t.buildAssignTicketRequest(payload),
      { ctx },
    );
    return await getTicket(id, ctx);
  } catch (err) {
    if (err instanceof AppError && err.status === 404) return null;
    throw err;
  }
};

module.exports = {
  // legacy aliases kept for any callers still using the old names
  getTickets:    listTickets,
  getTicketById: getTicket,
  // current API
  listTickets,
  getTicketStats,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  escalateTicket,
  closeTicket,
  assignTicket,
};
