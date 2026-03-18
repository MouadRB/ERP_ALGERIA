const env = require('../config/env');
const pimMock = require('../mocks/pim.mock');
const { transformProduct, transformProductList } = require('../transformers/pim.transformer');

const getProducts = async ({ page = 1, pageSize = 20, status, search } = {}) => {
  if (env.useMock) {
    let results = [...pimMock];
    if (status) results = results.filter((p) => p.status === status);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((p) => p.nameFr.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    const total = results.length;
    return { data: results.slice((page - 1) * pageSize, page * pageSize), meta: { total, page, pageSize } };
  }
  const res = await fetch(`${env.engineAUrl}/api/products?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  const json = await res.json();
  return { data: transformProductList(json.data ?? json), meta: json.meta };
};

const getProductById = async (id) => {
  if (env.useMock) return pimMock.find((p) => p.id === id) ?? null;
  const res = await fetch(`${env.engineAUrl}/api/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return transformProduct(await res.json());
};

module.exports = { getProducts, getProductById };