export function getOmsQueueMock() {
  return { items: [], updatedAt: new Date().toISOString() };
}

export function getOmsOrdersMock() {
  return { items: [], page: 1, limit: 20, total: 0 };
}

export function getOmsOrderMock(id) {
  return { id, status: "MOCK", createdAt: new Date().toISOString() };
}
