const env = require('../config/env');
const omsMock = require('../mocks/oms.mock');
const { transformOrder, transformOrderList } = require('../transformers/oms.transformer');

const getOrders = async ({ page = 1, pageSize = 20, search, status } = {}) => {
  if (env.useMock) {
    let results = [...omsMock];
    if (status) results = results.filter((o) => o.status === status);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.customerNameFr.toLowerCase().includes(q) ||
          o.customerPhone.includes(q),
      );
    }
    const total = results.length;
    const data = results.slice((page - 1) * pageSize, page * pageSize);
    return { data, meta: { total, page, pageSize } };
  }

  const res = await fetch(
    `${env.engineAUrl}/api/orders?page=${page}&pageSize=${pageSize}${status ? `&status=${status}` : ''}${search ? `&search=${search}` : ''}`,
  );
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  const json = await res.json();
  return { data: transformOrderList(json.data ?? json), meta: json.meta };
};

const getOrderById = async (id) => {
  if (env.useMock) {
    const order = omsMock.find((o) => o.id === id);
    return order ?? null;
  }
  const res = await fetch(`${env.engineAUrl}/api/orders/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return transformOrder(await res.json());
};

const confirmOrder = async (id, userId) => {
  if (env.useMock) {
    const order = omsMock.find((o) => o.id === id);
    if (!order) return null;
    order.status = 'Confirmed';
    order.updatedAt = new Date().toISOString();
    return order;
  }
  const res = await fetch(`${env.engineAUrl}/api/orders/${id}/confirm`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmedBy: userId }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return transformOrder(await res.json());
};

const cancelOrder = async (id, reason, userId) => {
  if (env.useMock) {
    const order = omsMock.find((o) => o.id === id);
    if (!order) return null;
    order.status = 'Cancelled';
    order.updatedAt = new Date().toISOString();
    return order;
  }
  const res = await fetch(`${env.engineAUrl}/api/orders/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, cancelledBy: userId }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return transformOrder(await res.json());
};

const assignCarrier = async (id, carrier, userId) => {
  if (env.useMock) {
    const order = omsMock.find((o) => o.id === id);
    if (!order) return null;
    order.carrier = carrier;
    order.status = 'HandedToCarrier';
    order.updatedAt = new Date().toISOString();
    return order;
  }
  const res = await fetch(`${env.engineAUrl}/api/orders/${id}/assign-carrier`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carrier, assignedBy: userId }),
  });
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return transformOrder(await res.json());
};

module.exports = { getOrders, getOrderById, confirmOrder, cancelOrder, assignCarrier };