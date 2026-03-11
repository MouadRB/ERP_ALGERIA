export function getCatalogueMock() {
  return { items: [], page: 1, limit: 20, total: 0 };
}

export function getCatalogueItemMock(id) {
  return { id, published: false };
}

export function getOpenSearchStatusMock() {
  return { status: "MOCK", lastReindexAt: null };
}
