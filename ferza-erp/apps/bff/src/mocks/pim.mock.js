export function getPimProductsMock() {
  return { items: [], page: 1, limit: 20, total: 0 };
}

export function getPimProductMock(id) {
  return { id, name: "Mock product" };
}
