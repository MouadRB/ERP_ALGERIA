module.exports = {
  stats: {
    ordersToday: 142,
    awaitingConfirmation: 23,
    deliveryRate: 0.784,
    outOfStockItems: 7,
  },
  confirmations: [
    {
      id: 'ORD-2026-00031',
      customer: 'Amina B.',
      wilaya: 'Alger',
      amountTTC: 18500,
      createdAt: '2026-03-17T08:12:00.000Z',
    },
    {
      id: 'ORD-2026-00032',
      customer: 'Yanis K.',
      wilaya: 'Oran',
      amountTTC: 9200,
      createdAt: '2026-03-17T09:03:00.000Z',
    },
  ],
  codFunnel: [
    { state: 'AwaitingValidation', count: 8 },
    { state: 'Confirmed', count: 35 },
    { state: 'HandedToCarrier', count: 28 },
    { state: 'OutForDelivery', count: 22 },
    { state: 'DeliveredCOD_Confirmed', count: 106 },
    { state: 'Returned', count: 9 },
  ],
  riskScore: {
    highRisk: 6,
    mediumRisk: 14,
    lowRisk: 122,
  },
  crmActivity: [
    { label: 'Appels sortants', value: 42 },
    { label: 'Tickets ouverts', value: 9 },
    { label: 'Tickets resolus', value: 31 },
  ],
  inventoryAlerts: [
    { sku: 'SKU-AL-1024', label: 'Huile 1L', level: 'critical', remaining: 3 },
    { sku: 'SKU-OR-5531', label: 'Riz 5kg', level: 'warning', remaining: 12 },
  ],
  procurement: {
    pendingBCs: 5,
    lateShipments: 2,
  },
};
