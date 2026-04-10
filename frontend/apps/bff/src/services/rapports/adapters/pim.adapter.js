// PIM Adapter — MOCK (static data)
// TODO: Replace with real API call when PIM module is merged

const env = require('../../../config/env');

async function getPimOverview(/* period */) {
  // if (!env.useMock) { return await fetch(...) }

  return {
    totalSKUs:              524,
    publishedSKUs:          487,
    draftSKUs:              37,
    tauxPublication:        92.9,

    publicationByCategory: [
      { category: 'Mode & Vêtements',   total: 182, published: 175, taux: 96.2 },
      { category: 'Électronique',        total: 98,  published: 92,  taux: 93.9 },
      { category: 'Sport & Loisirs',     total: 76,  published: 71,  taux: 93.4 },
      { category: 'Maison & Déco',       total: 64,  published: 58,  taux: 90.6 },
      { category: 'Beauté & Santé',      total: 52,  published: 46,  taux: 88.5 },
      { category: 'Alimentation',        total: 32,  published: 28,  taux: 87.5 },
      { category: 'Bébé & Enfant',       total: 20,  published: 17,  taux: 85.0 },
    ],

    maskedProducts: [
      { sku: 'SKU-ELEC-042', nameFr: 'Câble USB-C 2m', reason: 'Stock 0 + BC en attente', daysHidden: 12 },
      { sku: 'SKU-MODE-118', nameFr: 'T-shirt Oversize XL', reason: 'Stock 0', daysHidden: 8 },
      { sku: 'SKU-SPORT-033', nameFr: 'Ballon Football Pro', reason: 'Stock 0 + BC en attente', daysHidden: 5 },
      { sku: 'SKU-MAISON-071', nameFr: 'Coussin Velours 40x40', reason: 'Stock 0', daysHidden: 3 },
      { sku: 'SKU-BEAUTE-019', nameFr: 'Crème Hydratante 200ml', reason: 'Stock 0 + BC en attente', daysHidden: 15 },
    ],
    totalMasked: 23,

    topProductsCAMarge: [
      { sku: 'SKU-ELEC-001', nameFr: 'Écouteurs Bluetooth V5.3', ca: 1820000, marge: 38, qty: 312 },
      { sku: 'SKU-MODE-005', nameFr: 'Veste Cuir Homme', ca: 1560000, marge: 45, qty: 156 },
      { sku: 'SKU-ELEC-012', nameFr: 'Chargeur Rapide 65W', ca: 1240000, marge: 52, qty: 620 },
      { sku: 'SKU-SPORT-007', nameFr: 'Tapis Yoga Premium', ca: 980000, marge: 42, qty: 245 },
      { sku: 'SKU-MODE-022', nameFr: 'Sneakers Running 42', ca: 870000, marge: 35, qty: 174 },
      { sku: 'SKU-MAISON-003', nameFr: 'Lampe LED Bureau', ca: 760000, marge: 48, qty: 380 },
      { sku: 'SKU-BEAUTE-008', nameFr: 'Parfum Oriental 50ml', ca: 650000, marge: 55, qty: 130 },
      { sku: 'SKU-ELEC-025', nameFr: 'Support Téléphone Voiture', ca: 540000, marge: 60, qty: 450 },
      { sku: 'SKU-BEBE-002', nameFr: 'Poussette Pliable', ca: 480000, marge: 28, qty: 48 },
      { sku: 'SKU-ALIM-011', nameFr: 'Coffret Dattes Premium 1kg', ca: 420000, marge: 40, qty: 210 },
    ],

    tauxRetourProduits: [
      { sku: 'SKU-ELEC-042', nameFr: 'Câble USB-C 2m', tauxRetour: 18.5, orders: 120, returns: 22 },
      { sku: 'SKU-MODE-118', nameFr: 'T-shirt Oversize XL', tauxRetour: 15.2, orders: 98, returns: 15 },
      { sku: 'SKU-SPORT-033', nameFr: 'Ballon Football Pro', tauxRetour: 12.8, orders: 78, returns: 10 },
      { sku: 'SKU-MAISON-071', nameFr: 'Coussin Velours 40x40', tauxRetour: 11.3, orders: 62, returns: 7 },
    ],
    returnThreshold: 10,

    channelPerformance: [
      { channel: 'Site Web', commandes: 842, tauxLivraison: 74.5, panierMoyen: 8200 },
      { channel: 'WhatsApp', commandes: 405, tauxLivraison: 69.2, panierMoyen: 6800 },
    ],
  };
}

module.exports = { getPimOverview };
