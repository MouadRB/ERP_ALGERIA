const env = require('../config/env');
const inventoryMock = require('../mocks/inventory.mock');
const { transformInventoryItem, transformInventoryList } = require('../transformers/inventory.transformer');

const getStock = async ({ page = 1, pageSize = 20 } = {}) => {
  if (env.useMock) {
    const total = inventoryMock.length;
    return { data: inventoryMock.slice((page - 1) * pageSize, page * pageSize), meta: { total, page, pageSize } };
  }
  const res = await fetch(`${env.engineAUrl}/api/inventory?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  const json = await res.json();
  return { data: transformInventoryList(json.data ?? json), meta: json.meta };
};

const getStockBySKU = async (sku) => {
  if (env.useMock) return inventoryMock.find((i) => i.sku === sku) ?? null;
  const res = await fetch(`${env.engineAUrl}/api/inventory/${sku}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
  return transformInventoryItem(await res.json());
};

module.exports = { getStock, getStockBySKU };