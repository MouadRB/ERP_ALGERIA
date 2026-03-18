module.exports = {
  general: {
    defaultLocale: 'fr',
    supportedLocales: ['fr', 'ar'],
    timezone: 'Africa/Algiers',
    currency: 'DZD',
  },
  business: {
    businessHoursStart: '08:00',
    businessHoursEnd: '20:00',
    maxDeliveryAttempts: 3,
    lostInTransitThresholdDays: 15,
    codReconciliationToleranceDZD: 1,
  },
  carriers: ['Yalidine', 'Maystro', 'Ecotrack', 'Procolis'],
  tvaRates: { standard: 0.19, reduced: 0.09, exempt: 0 },
  warehouses: [
    { id: 'WH-ALGER-01', nameFr: 'Entrepôt Alger Principal', wilayaCode: '16' },
    { id: 'WH-ORAN-01', nameFr: 'Entrepôt Oran', wilayaCode: '31' },
  ],
};