export function getCustomersMock() {
  return { items: [], page: 1, limit: 20, total: 0 };
}

export function getCustomerMock(id) {
  return { id, name: "Mock customer" };
}
