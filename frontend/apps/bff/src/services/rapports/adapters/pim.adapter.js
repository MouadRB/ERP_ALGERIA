// PIM Adapter — LIVE data from pim.mock (+ catalogue / oms / inventory joins).
// Rapport owns nothing: all KPIs are derived from the same mocks that the PIM,
// Catalogue and OMS modules consume, so the numbers stay in lock-step.

const pimProducts      = () => require('../../../mocks/pim.mock').products;
const catalogueEntries = () => require('../../../mocks/catalogue.mock').catalogueEntries;
const mockOrders       = () => require('../../../mocks/oms-orders.mock');
const inventoryService = require('../../inventory.service');

const DELIVERED_STATES = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
const RETURNED_STATES  = ['Returned', 'ReturnInTransit_Refused', 'LostInTransit'];

const PERIOD_DAYS = { today: 1, '7d': 7, '30d': 30, quarter: 90, year: 365 };

function resolvePeriod(period) {
  if (period && typeof period === 'object' && period.from) {
    return { from: new Date(period.from), to: period.to ? new Date(period.to) : new Date() };
  }
  const days = PERIOD_DAYS[period] || 30;
  const to   = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  return { from, to };
}

function filterByPeriod(orders, period) {
  const { from, to } = resolvePeriod(period);
  return orders.filter((o) => { const d = new Date(o.createdAt); return d >= from && d <= to; });
}

function pct(a, b) { return b > 0 ? Math.round((a / b) * 1000) / 10 : 0; }

async function getPimOverview(period = '30d') {
  const products  = pimProducts();
  const catalogue = catalogueEntries();
  const orders    = filterByPeriod(mockOrders(), period);

  // ── SKU counts (one SKU per variant; fall back to product.sku) ──
  const allSkus = products.flatMap((p) => (p.variants?.length ? p.variants.map((v) => ({ sku: v.sku, product: p })) : [{ sku: p.sku, product: p }]));
  const totalSKUs     = allSkus.length;
  const publishedSKUs = allSkus.filter(({ product }) => product.status === 'active').length;
  const draftSKUs     = allSkus.filter(({ product }) => product.status === 'draft' || product.status === 'ocr_import').length;
  const tauxPublication = pct(publishedSKUs, totalSKUs);

  // ── Publication rate by category ──
  const catMap = {};
  allSkus.forEach(({ product }) => {
    const cat = product.categoryId || 'Autre';
    if (!catMap[cat]) catMap[cat] = { category: cat, total: 0, published: 0 };
    catMap[cat].total += 1;
    if (product.status === 'active') catMap[cat].published += 1;
  });
  const publicationByCategory = Object.values(catMap).map((c) => ({ ...c, taux: pct(c.published, c.total) }));

  // ── Masked products (Catalogue status === 'masked') ──
  const maskedEntries = catalogue.filter((e) => e.status === 'masked');
  const now = Date.now();
  const maskedProducts = maskedEntries.slice(0, 10).map((e) => {
    const p = products.find((pr) => pr.id === e.productId || pr.sku === e.sku);
    const maskEvent = (e.history || []).find((h) => h.type === 'mask');
    const daysHidden = maskEvent ? Math.max(0, Math.round((now - new Date(maskEvent.at).getTime()) / 86400000)) : null;
    const stock = inventoryService.getStockForProduct({ sku: e.sku, productId: e.productId });
    const reason = stock && stock.quantityOnHand === 0 ? 'Stock 0' : 'Masque manuel';
    return { sku: e.sku, nameFr: p?.nameFr || e.sku, reason, daysHidden };
  });
  const totalMasked = maskedEntries.length;

  // ── Top products by CA/marge (from delivered orders in period) ──
  const prodMap = {};
  orders.filter((o) => DELIVERED_STATES.includes(o.status)).forEach((o) => {
    (o.items || []).forEach((item) => {
      const key = item.productId || item.sku;
      if (!prodMap[key]) {
        const p = products.find((pr) => pr.id === item.productId || pr.sku === item.sku);
        prodMap[key] = {
          sku:        item.sku,
          nameFr:     p?.nameFr || item.sku,
          priceTTC:   p?.priceTTC || item.unitPriceTTC || 0,
          costFifo:   p?.costFifo || 0,
          ca: 0, qty: 0,
        };
      }
      prodMap[key].ca  += (item.unitPriceTTC || 0) * (item.quantity || 0);
      prodMap[key].qty += item.quantity || 0;
    });
  });
  const topProductsCAMarge = Object.values(prodMap)
    .map((p) => ({
      sku:    p.sku,
      nameFr: p.nameFr,
      ca:     p.ca,
      qty:    p.qty,
      marge:  p.priceTTC > 0 ? Math.round(((p.priceTTC - p.costFifo) / p.priceTTC) * 100) : 0,
    }))
    .sort((a, b) => b.ca - a.ca)
    .slice(0, 10);

  // ── Return rate per product (all orders in period with returned status) ──
  const returnMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const key = item.productId || item.sku;
      if (!returnMap[key]) {
        const p = products.find((pr) => pr.id === item.productId || pr.sku === item.sku);
        returnMap[key] = { sku: item.sku, nameFr: p?.nameFr || item.sku, orders: 0, returns: 0 };
      }
      returnMap[key].orders += 1;
      if (RETURNED_STATES.includes(o.status)) returnMap[key].returns += 1;
    });
  });
  const tauxRetourProduits = Object.values(returnMap)
    .filter((r) => r.orders >= 3)
    .map((r) => ({ ...r, tauxRetour: pct(r.returns, r.orders) }))
    .sort((a, b) => b.tauxRetour - a.tauxRetour)
    .slice(0, 10);
  const returnThreshold = 10;

  // ── Channel performance (from OMS source + delivered) ──
  const channelMap = {};
  orders.forEach((o) => {
    const s = o.source || 'Autre';
    if (!channelMap[s]) channelMap[s] = { channel: s, commandes: 0, delivered: 0, failed: 0, caTotal: 0 };
    channelMap[s].commandes += 1;
    if (DELIVERED_STATES.includes(o.status)) {
      channelMap[s].delivered += 1;
      channelMap[s].caTotal   += o.totalTTC || 0;
    }
    if (o.status === 'DeliveryFailed_Absent' || RETURNED_STATES.includes(o.status)) channelMap[s].failed += 1;
  });
  const channelPerformance = Object.values(channelMap).map((c) => ({
    channel:       c.channel,
    commandes:     c.commandes,
    tauxLivraison: pct(c.delivered, c.delivered + c.failed),
    panierMoyen:   c.delivered > 0 ? Math.round(c.caTotal / c.delivered) : 0,
  }));

  return {
    totalSKUs,
    publishedSKUs,
    draftSKUs,
    tauxPublication,
    publicationByCategory,
    maskedProducts,
    totalMasked,
    topProductsCAMarge,
    tauxRetourProduits,
    returnThreshold,
    channelPerformance,
  };
}

module.exports = { getPimOverview };
