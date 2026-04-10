// Procurement Adapter — MOCK (static data)
// TODO: Replace with real API call when Procurement module is merged

const env = require('../../../config/env');

async function getProcurementOverview(/* period */) {
  // if (!env.useMock) { return await fetch(...) }

  return {
    bcPipeline: {
      total:       42,
      brouillon:   8,
      enAttente:   12,
      approuve:    15,
      enCours:     5,
      recu:        2,
      totalValue:  18500000,
    },

    pendingApprovals: [
      { id: 'BC-2025-038', supplier: 'TechParts DZ', value: 2800000, items: 15, daysWaiting: 3, priority: 'haute' },
      { id: 'BC-2025-039', supplier: 'ModeTex Oran', value: 1950000, items: 42, daysWaiting: 2, priority: 'normale' },
      { id: 'BC-2025-040', supplier: 'SportGear Alger', value: 980000, items: 8, daysWaiting: 5, priority: 'haute' },
      { id: 'BC-2025-041', supplier: 'BeautéPro', value: 650000, items: 20, daysWaiting: 1, priority: 'normale' },
    ],

    supplierPerformance: [
      { name: 'TechParts DZ',    bcCount: 12, onTime: 10, tauxOnTime: 83.3, delaiMoyen: 8,  qualityScore: 92 },
      { name: 'ModeTex Oran',    bcCount: 9,  onTime: 8,  tauxOnTime: 88.9, delaiMoyen: 12, qualityScore: 87 },
      { name: 'SportGear Alger', bcCount: 7,  onTime: 5,  tauxOnTime: 71.4, delaiMoyen: 15, qualityScore: 78 },
      { name: 'BeautéPro',       bcCount: 6,  onTime: 6,  tauxOnTime: 100,  delaiMoyen: 6,  qualityScore: 95 },
      { name: 'MaisonPlus',      bcCount: 5,  onTime: 4,  tauxOnTime: 80.0, delaiMoyen: 10, qualityScore: 84 },
      { name: 'AlimFresh',       bcCount: 3,  onTime: 3,  tauxOnTime: 100,  delaiMoyen: 4,  qualityScore: 98 },
    ],

    receptionRecente: [
      { bcId: 'BC-2025-032', supplier: 'TechParts DZ', receivedAt: '2025-03-24', items: 8, conformity: 100 },
      { bcId: 'BC-2025-030', supplier: 'ModeTex Oran', receivedAt: '2025-03-22', items: 35, conformity: 94 },
      { bcId: 'BC-2025-028', supplier: 'AlimFresh', receivedAt: '2025-03-20', items: 12, conformity: 100 },
    ],

    alerts: [
      { type: 'retard', message: 'BC-2025-035 (SportGear) en retard de 3 jours', severity: 'haute' },
      { type: 'budget', message: 'Budget mensuel approvisionnement à 78%', severity: 'moyenne' },
      { type: 'qualite', message: 'Taux de conformité SportGear < 80%', severity: 'haute' },
    ],
  };
}

module.exports = { getProcurementOverview };
