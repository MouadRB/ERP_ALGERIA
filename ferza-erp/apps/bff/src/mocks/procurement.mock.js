export function getProcurementBCsMock() {
  return { items: [], page: 1, limit: 20, total: 0 };
}

export function getProcurementBCMock(id) {
  return { id, state: "BROUILLON" };
}
