/**
 * rapports.service.js
 *
 * Aggregation layer that calls adapters and assembles per-tab responses.
 * Each public function returns ALL data needed for ONE tab — no waterfalls.
 */

const { getOmsOverview }         = require('./rapports/adapters/oms.adapter');
const { getCrmOverview }         = require('./rapports/adapters/crm.adapter');
const { getPimOverview }         = require('./rapports/adapters/pim.adapter');
const { getCatalogueOverview }   = require('./rapports/adapters/catalogue.adapter');
const { getInventoryOverview }   = require('./rapports/adapters/inventory.adapter');
const { getProcurementOverview } = require('./rapports/adapters/procurement.adapter');

// ─── Tab 1: Vue d'Ensemble ──────────────────────────────────────────────────

const getOverview = async (period = '30d', comparison = false) => {
  const [oms, crm, pim, inventory, procurement] = await Promise.all([
    getOmsOverview(period, comparison),
    getCrmOverview(period),
    getPimOverview(period),
    getInventoryOverview(period),
    getProcurementOverview(period),
  ]);

  // Health scorecard
  const health = [
    { module: 'OMS',              score: oms.tauxLivraison > 70 ? 85 : 65, status: oms.tauxLivraison > 70 ? 'ok' : 'warning', action: oms.tauxLivraison <= 70 ? 'Taux livraison en dessous de 70%' : null },
    { module: 'CRM',              score: crm.blacklistedCount < 3 ? 90 : 70, status: crm.blacklistedCount < 3 ? 'ok' : 'warning', action: crm.blacklistedCount >= 3 ? `${crm.blacklistedCount} clients blacklistés` : null },
    { module: 'PIM',              score: Math.round(pim.tauxPublication), status: pim.tauxPublication > 90 ? 'ok' : 'warning', action: pim.totalMasked > 0 ? `${pim.totalMasked} produits masqués` : null },
    { module: 'Inventaire',       score: inventory.totalAlertes < 5 ? 88 : 72, status: inventory.totalAlertes < 5 ? 'ok' : 'warning', action: inventory.totalAlertes > 0 ? `${inventory.totalAlertes} alertes réappro` : null },
    { module: 'Approvisionnement', score: procurement.bcPipeline.enAttente < 10 ? 82 : 68, status: procurement.bcPipeline.enAttente < 10 ? 'ok' : 'warning', action: procurement.alerts.length > 0 ? procurement.alerts[0].message : null },
  ];
  const globalScore = Math.round(health.reduce((s, h) => s + h.score, 0) / health.length);

  // Alerts
  const alerts = [];
  if (inventory.totalAlertes > 0) alerts.push({ module: 'Inventaire', message: `${inventory.totalAlertes} produits en alerte réapprovisionnement`, severity: 'haute' });
  if (pim.totalMasked > 0)        alerts.push({ module: 'PIM', message: `${pim.totalMasked} produits masqués automatiquement (stock 0)`, severity: 'moyenne' });
  procurement.alerts.forEach((a) => alerts.push({ module: 'Approvisionnement', ...a }));
  if (oms.failedCount > 5)        alerts.push({ module: 'OMS', message: `${oms.failedCount} commandes en échec sur la période`, severity: 'moyenne' });

  return {
    kpis: {
      ca:               { value: oms.totalCA, delta: oms.comparison?.deltaCA ?? null, source: 'OMS' },
      commandes:        { value: oms.totalOrders, confirmed: oms.confirmedCount, delivered: oms.deliveredCount, delta: oms.comparison?.deltaOrders ?? null, source: 'OMS' },
      tauxLivraison:    { value: oms.tauxLivraison, echecs: oms.failedCount, annulations: oms.cancelledCount, retours: oms.returnedCount, delta: oms.comparison?.deltaLivraison ?? null, source: 'OMS+CRM' },
      valorisationStock: { value: inventory.valorisationFIFO.total, byWarehouse: inventory.valorisationFIFO.byWarehouse, source: 'Inventaire (FIFO)' },
    },
    funnel:         oms.funnelData,
    topProductsCA:  oms.topProductsCA.slice(0, 5),
    alerts,
    caByWilaya:     oms.caByWilaya,
    health,
    globalScore,
  };
};

// ─── Tab 2: Ventes & OMS ────────────────────────────────────────────────────

const getVentesOms = async (period = '30d', comparison = false) => {
  return await getOmsOverview(period, comparison);
};

// ─── Tab 3: Produits & Catalogue ────────────────────────────────────────────

const getProduitsCatalogue = async (period = '30d', comparison = false) => {
  const [pim, catalogue] = await Promise.all([
    getPimOverview(period),
    getCatalogueOverview(period),
  ]);
  return { ...pim, ...catalogue };
};

// ─── Tab 4: Inventaire & Stock ──────────────────────────────────────────────

const getInventaireStock = async (period = '30d', comparison = false) => {
  return await getInventoryOverview(period);
};

// ─── Tab 5: Clients & CRM ──────────────────────────────────────────────────

const getClientsCrm = async (period = '30d', comparison = false) => {
  return await getCrmOverview(period);
};

// ─── Tab 6: Approvisionnement ───────────────────────────────────────────────

const getApprovisionnement = async (period = '30d', comparison = false) => {
  return await getProcurementOverview(period);
};

// ─── Tab 7: Cross-Module ────────────────────────────────────────────────────

const getCrossModule = async (period = '30d', comparison = false) => {
  const [oms, crm, pim, inventory, procurement] = await Promise.all([
    getOmsOverview(period, comparison),
    getCrmOverview(period),
    getPimOverview(period),
    getInventoryOverview(period),
    getProcurementOverview(period),
  ]);

  return {
    ordersToStock: {
      totalOrders:     oms.totalOrders,
      stockValue:      inventory.valorisationFIFO.total,
      alertes:         inventory.totalAlertes,
      maskedProducts:  pim.totalMasked,
    },
    clientRetention: {
      totalCustomers: crm.totalCustomers,
      activeCount:    crm.activeCount,
      vipCount:       crm.vipCount,
      avgCA:          crm.avgCA,
      tauxLivraison:  oms.tauxLivraison,
    },
    supplyChain: {
      bcPending:             procurement.bcPipeline.enAttente,
      stockAlerts:           inventory.totalAlertes,
      maskedFromCatalogue:   pim.totalMasked,
      avgSupplierOnTime:     procurement.supplierPerformance.length > 0
        ? Math.round(procurement.supplierPerformance.reduce((s, sp) => s + sp.tauxOnTime, 0) / procurement.supplierPerformance.length)
        : 0,
    },
    channelMix: {
      omsSource:         oms.sourceDistribution,
      crmChannel:        crm.channelDistribution,
      catalogueChannels: pim.channelPerformance,
    },
  };
};

module.exports = {
  getOverview,
  getVentesOms,
  getProduitsCatalogue,
  getInventaireStock,
  getClientsCrm,
  getApprovisionnement,
  getCrossModule,
};
