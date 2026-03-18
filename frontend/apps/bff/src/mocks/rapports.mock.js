module.exports = {
  overview: {
    period: { from: '2025-03-01T00:00:00.000Z', to: '2025-03-15T23:59:59.000Z' },
    totalRevenueTTC: 320000,
    totalOrders: 148,
    deliveryRate: 0.72,
    returnRate: 0.08,
    avgOrderValueTTC: 21621,
    codCollectionRate: 0.85,
    topWilaya: { code: '16', name: 'Alger', orders: 54 },
  },
  codFunnel: [
    { state: 'Draft', count: 12 },
    { state: 'AwaitingValidation', count: 8 },
    { state: 'Confirmed', count: 35 },
    { state: 'HandedToCarrier', count: 28 },
    { state: 'OutForDelivery', count: 22 },
    { state: 'DeliveredCOD_Confirmed', count: 106 },
    { state: 'DeliveryFailed_Absent', count: 18 },
    { state: 'Returned', count: 9 },
  ],
  moduleHealth: [
    { module: 'OMS', status: 'ok', p99Ms: 180 },
    { module: 'Inventory', status: 'ok', p99Ms: 95 },
    { module: 'PIM', status: 'ok', p99Ms: 210 },
    { module: 'CRM', status: 'warning', p99Ms: 650 },
    { module: 'Procurement', status: 'ok', p99Ms: 300 },
  ],
};