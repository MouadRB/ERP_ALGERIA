// Inventory Adapter — MOCK (static data)
// TODO: Replace with real API call when Inventory module is merged

const env = require('../../../config/env');

async function getInventoryOverview(/* period */) {
  // if (!env.useMock) { return await fetch(...) }

  return {
    valorisationFIFO: {
      total: 48420000,
      byWarehouse: [
        { code: 'WH-01', name: 'Entrepôt Central Alger', value: 48420000, pct: 100 },
      ],
    },

    alertesReappro: [
      { sku: 'SKU-ELEC-001', nameFr: 'Écouteurs Bluetooth V5.3', stock: 12, seuil: 50, urgency: 'critique' },
      { sku: 'SKU-MODE-005', nameFr: 'Veste Cuir Homme', stock: 3, seuil: 20, urgency: 'critique' },
      { sku: 'SKU-ELEC-012', nameFr: 'Chargeur Rapide 65W', stock: 28, seuil: 100, urgency: 'haute' },
      { sku: 'SKU-SPORT-007', nameFr: 'Tapis Yoga Premium', stock: 15, seuil: 40, urgency: 'haute' },
      { sku: 'SKU-MODE-022', nameFr: 'Sneakers Running 42', stock: 42, seuil: 60, urgency: 'moyenne' },
      { sku: 'SKU-MAISON-003', nameFr: 'Lampe LED Bureau', stock: 55, seuil: 80, urgency: 'moyenne' },
      { sku: 'SKU-BEAUTE-008', nameFr: 'Parfum Oriental 50ml', stock: 8, seuil: 30, urgency: 'haute' },
      { sku: 'SKU-ALIM-011', nameFr: 'Coffret Dattes Premium 1kg', stock: 22, seuil: 50, urgency: 'moyenne' },
    ],
    totalAlertes: 8,

    typesMouvements: {
      total: 1247,
      reception:  520,
      sortie:     480,
      retour:     147,
      transfert:  100,
    },

    reservationsActives: {
      total:       342,
      soft:        180,
      hard:        120,
      quarantaine: 42,
    },

    couchesFIFO: [
      { month: 'Oct 2024', electronique: 12400000, mode: 8200000, sport: 3100000, autre: 2800000 },
      { month: 'Nov 2024', electronique: 13100000, mode: 8800000, sport: 3400000, autre: 3000000 },
      { month: 'Déc 2024', electronique: 14500000, mode: 9500000, sport: 3800000, autre: 3200000 },
      { month: 'Jan 2025', electronique: 13800000, mode: 9100000, sport: 3500000, autre: 3100000 },
      { month: 'Fév 2025', electronique: 14200000, mode: 9300000, sport: 3700000, autre: 3200000 },
      { month: 'Mar 2025', electronique: 14800000, mode: 9600000, sport: 3900000, autre: 3100000 },
    ],

    transfertsInterEntrepot: [],

    stockQuarantaine: [
      { sku: 'SKU-ELEC-042', nameFr: 'Câble USB-C 2m', qty: 15, reason: 'Retour client – défaut', inspection: 'En attente' },
      { sku: 'SKU-MODE-118', nameFr: 'T-shirt Oversize XL', qty: 8, reason: 'Retour client – taille', inspection: 'Inspecté' },
      { sku: 'SKU-SPORT-033', nameFr: 'Ballon Football Pro', qty: 5, reason: 'Dommage transport', inspection: 'En attente' },
    ],
    totalQuarantaine: 42,

    rotationStock: [
      { category: 'Électronique',   rotation: 4.2, stock: 14800000, vendu: 62160000 },
      { category: 'Mode & Vêtements', rotation: 3.8, stock: 9600000,  vendu: 36480000 },
      { category: 'Sport & Loisirs',  rotation: 3.1, stock: 3900000,  vendu: 12090000 },
      { category: 'Maison & Déco',    rotation: 2.5, stock: 3100000,  vendu: 7750000  },
      { category: 'Beauté & Santé',   rotation: 2.8, stock: 2200000,  vendu: 6160000  },
      { category: 'Alimentation',     rotation: 5.2, stock: 1800000,  vendu: 9360000  },
    ],

    topReserved: [
      { sku: 'SKU-ELEC-001', nameFr: 'Écouteurs Bluetooth V5.3', reserved: 78, type: 'hard' },
      { sku: 'SKU-MODE-022', nameFr: 'Sneakers Running 42',       reserved: 64, type: 'soft' },
      { sku: 'SKU-ELEC-012', nameFr: 'Chargeur Rapide 65W',       reserved: 51, type: 'hard' },
      { sku: 'SKU-SPORT-007', nameFr: 'Tapis Yoga Premium',       reserved: 38, type: 'soft' },
      { sku: 'SKU-MODE-005', nameFr: 'Veste Cuir Homme',          reserved: 29, type: 'soft' },
    ],
  };
}

module.exports = { getInventoryOverview };
