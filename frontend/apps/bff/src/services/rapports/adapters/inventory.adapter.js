// Inventory Adapter — LIVE data computed via inventory.service.
// Rapport consumes the same enrichment pipeline Inventory itself uses so
// reservations, FIFO valuation, movements and alerts always stay in sync.

const inventoryService = require('../../inventory.service');
const inventoryMocks   = () => require('../../../mocks/inventory.mock');
const pimProducts      = () => require('../../../mocks/pim.mock').products;

const CATEGORY_LABEL = {
  Electronique: 'Électronique',
  Mode:         'Mode & Vêtements',
  Sport:        'Sport & Loisirs',
  Maison:       'Maison & Déco',
  Beaute:       'Beauté & Santé',
  Alimentation: 'Alimentation',
};

function catLabel(key) { return CATEGORY_LABEL[key] || key || 'Autre'; }

async function getInventoryOverview(/* period */) {
  const stock      = await inventoryService.getStock({ page: 1, pageSize: 1000 });
  const alerts     = await inventoryService.getAlerts();
  const movements  = (inventoryMocks().movements) || [];
  const products   = pimProducts();

  const items = stock.data || [];

  // ── FIFO valuation ──
  const totalValue = items.reduce((s, it) => s + (it.stockValue || 0), 0);
  const valorisationFIFO = {
    total: totalValue,
    byWarehouse: [
      { code: 'WH-01', name: 'Entrepôt Central Alger', value: totalValue, pct: 100 },
    ],
  };

  // ── Alertes reappro ──
  const alertesReappro = alerts.map((it) => ({
    sku:     it.sku,
    nameFr:  it.nameFr,
    stock:   it.quantityAvailable,
    seuil:   it.reorderPoint,
    urgency: it.quantityAvailable <= 0 ? 'critique'
           : it.quantityAvailable <= (it.reorderPoint || 0) / 2 ? 'haute'
           : 'moyenne',
  }));
  const totalAlertes = alertesReappro.length;

  // ── Movement type distribution ──
  const typeMap = { reception: 0, sortie: 0, retour: 0, transfert: 0 };
  movements.forEach((m) => {
    if (m.type === 'receipt')         typeMap.reception += 1;
    else if (m.type === 'sale')       typeMap.sortie    += 1;
    else if (m.type === 'return')     typeMap.retour    += 1;
    else if (m.type === 'transfer')   typeMap.transfert += 1;
    else if (m.quantity > 0)          typeMap.reception += 1;
    else                              typeMap.sortie    += 1;
  });
  const typesMouvements = { total: movements.length, ...typeMap };

  // ── Active reservations (from enriched items, derived from OMS) ──
  let soft = 0, hard = 0, quarantaine = 0;
  items.forEach((it) => {
    soft += it.softReserved || 0;
    hard += it.hardReserved || 0;
    quarantaine += it.quantityQuarantined || 0;
  });
  const reservationsActives = { total: soft + hard + quarantaine, soft, hard, quarantaine };

  // ── Stock in quarantine ──
  const stockQuarantaine = items
    .filter((it) => (it.quantityQuarantined || 0) > 0 || (it.returns || []).some((r) => r.status === 'Quarantaine'))
    .map((it) => ({
      sku:        it.sku,
      nameFr:     it.nameFr,
      qty:        it.quantityQuarantined || (it.returns || []).filter((r) => r.status === 'Quarantaine').reduce((s, r) => s + (r.quantity || 0), 0),
      reason:     (it.returns?.[0]?.reason) || 'Retour client',
      inspection: (it.returns?.[0]?.inspectionStatus === 'pending') ? 'En attente' : 'Inspecté',
    }));
  const totalQuarantaine = stockQuarantaine.reduce((s, q) => s + (q.qty || 0), 0);

  // ── Rotation by category ──
  const catMap = {};
  items.forEach((it) => {
    const key = catLabel(it.categoryId);
    if (!catMap[key]) catMap[key] = { category: key, stock: 0, vendu: 0 };
    catMap[key].stock += it.stockValue || 0;
    // Vendu = sum of sale movements for this SKU * costFifo
    const saleQty = movements
      .filter((m) => m.sku === it.sku && m.type === 'sale')
      .reduce((s, m) => s + Math.abs(m.quantity || 0), 0);
    catMap[key].vendu += saleQty * (it.costFifo || 0);
  });
  const rotationStock = Object.values(catMap).map((c) => ({
    ...c,
    rotation: c.stock > 0 ? Math.round((c.vendu / c.stock) * 10) / 10 : 0,
  }));

  // ── Top reserved SKUs (by reserved qty) ──
  const topReserved = items
    .filter((it) => (it.quantityReserved || 0) > 0)
    .sort((a, b) => (b.quantityReserved || 0) - (a.quantityReserved || 0))
    .slice(0, 5)
    .map((it) => ({
      sku:      it.sku,
      nameFr:   it.nameFr,
      reserved: it.quantityReserved,
      type:     (it.hardReserved || 0) >= (it.softReserved || 0) ? 'hard' : 'soft',
    }));

  // ── FIFO layers by month × category ──
  const layerMap = {};
  items.forEach((it) => {
    const cat = catLabel(it.categoryId).toLowerCase().split(' ')[0];
    (it.fifoLayers || []).forEach((layer) => {
      const m = new Date(layer.receivedAt).toISOString().slice(0, 7);
      if (!layerMap[m]) layerMap[m] = { month: m, electronique: 0, mode: 0, sport: 0, autre: 0 };
      const val = (layer.quantityRemaining || 0) * (layer.unitCostHT || 0);
      if (cat.startsWith('élec') || cat.startsWith('elec')) layerMap[m].electronique += val;
      else if (cat.startsWith('mode')) layerMap[m].mode += val;
      else if (cat.startsWith('sport')) layerMap[m].sport += val;
      else layerMap[m].autre += val;
    });
  });
  const couchesFIFO = Object.values(layerMap).sort((a, b) => a.month.localeCompare(b.month));

  return {
    valorisationFIFO,
    alertesReappro,
    totalAlertes,
    typesMouvements,
    reservationsActives,
    couchesFIFO,
    transfertsInterEntrepot: [],
    stockQuarantaine,
    totalQuarantaine,
    rotationStock,
    topReserved,
  };
}

module.exports = { getInventoryOverview };
