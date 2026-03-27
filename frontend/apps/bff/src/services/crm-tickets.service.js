const env = require('../config/env');
const ticketsMock = require('../mocks/crm-tickets.mock');

const getTickets = async (params = {}) => {
  if (env.useMock) {
    const { page = 1, pageSize = 20, customerId, status, category, priority } = params;

    let results = [...ticketsMock];

    if (customerId)  results = results.filter((t) => t.customerId === customerId);
    if (status)      results = results.filter((t) => t.status === status);
    if (category)    results = results.filter((t) => t.category === category);
    if (priority)    results = results.filter((t) => t.priority === priority);

    // Most recent first
    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const total = results.length;
    return { data: results.slice((page - 1) * pageSize, page * pageSize), meta: { total, page, pageSize } };
  }
  throw new Error('Tickets service not implemented for real backend');
};

const getTicketById = async (id) => {
  if (env.useMock) return ticketsMock.find((t) => t.id === id) || null;
  throw new Error('Not implemented');
};

const createTicket = async (body) => {
  if (env.useMock) {
    const newTicket = {
      id: `TKT-${String(ticketsMock.length + 1).padStart(3, '0')}`,
      customerId: body.customerId,
      customerPhone: body.customerPhone || '',
      customerNameFr: body.customerNameFr || '',
      customerWilayaCode: body.customerWilayaCode || '16',
      orderId: body.orderId || null,
      category: body.category,
      status: 'Ouvert',
      priority: body.priority || 'Normale',
      subject: body.subject || body.category,
      description: body.description || '',
      agentId: null,
      agentName: null,
      escalated: false,
      lastAction: 'Ticket créé',
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ticketsMock.push(newTicket);
    return newTicket;
  }
  throw new Error('Not implemented');
};

const updateTicket = async (id, body) => {
  if (env.useMock) {
    const ticket = ticketsMock.find((t) => t.id === id);
    if (!ticket) return null;
    if (body.status)    ticket.status    = body.status;
    if (body.agentId)   ticket.agentId   = body.agentId;
    if (body.agentName) ticket.agentName = body.agentName;
    if (body.escalated !== undefined) ticket.escalated = body.escalated;
    if (body.lastAction) ticket.lastAction = body.lastAction;
    if (body.note) {
      if (!ticket.notes) ticket.notes = [];
      ticket.notes.push({ ...body.note, createdAt: new Date().toISOString() });
    }
    ticket.updatedAt = new Date().toISOString();
    return ticket;
  }
  throw new Error('Not implemented');
};

module.exports = { getTickets, getTicketById, createTicket, updateTicket };
