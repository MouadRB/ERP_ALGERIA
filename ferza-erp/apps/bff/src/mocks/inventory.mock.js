export function getInventoryStockMock() {
  return { items: [], page: 1, limit: 50, total: 0 };
}

export function getInventorySkuMock(sku) {
  return { sku, stock: 0 };
}

export function getInventoryAlertsMock() {
  return { alerts: [] };
}

export function getFifoCostsMock() {
  return { items: [] };
}
