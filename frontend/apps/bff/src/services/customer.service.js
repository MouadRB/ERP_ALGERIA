const env = require('../config/env');
const crmMock = require('../mocks/crm.mock');
const { transformCustomer, transformCustomerList } = require('../transformers/crm.transformer');

const getCustomers = async ({ page = 1, pageSize = 20, search, segment } = {}) => {
  if (env.useMock) {
    let results = [...crmMock];
    if (segment) results = results.filter((c) => c.segment === segment);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (c) =>
          c.phone.includes(q) ||
          c.nameFr.toLowerCase().includes(q),
      );
    }
    const total = results.length;
    return { data: results.slice((page - 1) * pageSize, page * pageSize), meta: { total, page, pageSize } };
  }
  const res = await fetch(`${env.engineBUrl}/api/customers?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  const json = await res.json();
  return { data: transformCustomerList(json.data ?? json), meta: json.meta };
};

const getCustomerById = async (id) => {
  if (env.useMock) return crmMock.find((c) => c.id === id) ?? null;
  const res = await fetch(`${env.engineBUrl}/api/customers/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine B error: ${res.status}`);
  return transformCustomer(await res.json());
};

module.exports = { getCustomers, getCustomerById };