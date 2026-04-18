/**
 * Cross-Module Enrichment Helpers
 *
 * Enforces the Source of Truth map:
 *   Product master data  → PIM
 *   Stock & movements    → Inventory
 *   Customer identity    → CRM
 *   Publication status   → Catalogue
 *   Orders & transitions → OMS
 *   Rapport              → computed (owns nothing)
 *
 * Every cross-module join happens here. The frontend calls one BFF
 * endpoint per view and gets a fully enriched response.
 */

// Lazy requires so modules can be mutated and the helpers always
// read the current in-memory state.
const pimProducts = () => require('../mocks/pim.mock').products;
const crmCustomers = () => require('../mocks/crm.mock');
const catalogueEntries = () => require('../mocks/catalogue.mock').catalogueEntries;
const omsOrders = () => require('../mocks/oms-orders.mock');

// ─── PIM enrichment (RULE 1) ───────────────────────────────────────────────

/**
 * Resolve product master data from PIM by SKU or productId.
 * Returns a snapshot of PIM-owned fields, or null if not found.
 */
function resolveProduct(sku, productId) {
  const products = pimProducts();
  return products.find(
    (p) => (sku && p.sku === sku) || (productId && p.id === productId),
  ) || null;
}

/**
 * Enrich an order line item with PIM product data.
 * Captured-at-order-time fields (unitPriceTTC, unitPriceHT, tvaRate) are preserved.
 */
function enrichOrderItem(item) {
  const product = resolveProduct(item.sku, item.productId);
  return {
    ...item,
    nameFr: product?.nameFr ?? 'Produit inconnu',
    nameAr: product?.nameAr ?? '',
    productImage: product?.mediaUrls?.[0] ?? null,
  };
}

/**
 * Enrich all line items on an order.
 */
function enrichOrderItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map(enrichOrderItem);
}

// ─── CRM enrichment (RULE 4) ───────────────────────────────────────────────

/**
 * Resolve customer from CRM by customerId or phone.
 * Returns the canonical customer profile, or a minimal fallback.
 */
function resolveCustomer(customerId, phone) {
  const customers = crmCustomers();
  return customers.find(
    (c) => (customerId && c.id === customerId) || (phone && c.phone === phone),
  ) || null;
}

/**
 * Build the customer enrichment object for an OMS order.
 * Shipping address stays on the order (captured at order time).
 * Identity, risk, and contact data come from CRM.
 */
function enrichOrderCustomer(order) {
  const crm = resolveCustomer(order.customerId, order.customerPhone);
  if (!crm) {
    return {
      id: order.customerId || null,
      nameFr: order.customerPhone || 'Client inconnu',
      nameAr: '',
      phone: order.customerPhone || '',
      wilayaCode: crm?.wilayaCode ?? order.wilayaCode ?? '',
      address: crm?.address ?? order.address ?? '',
      riskLevel: 'LOW',
      fraudScore: 0,
      riskSignals: [],
      blacklisted: false,
      lastDelivery: null,
    };
  }
  return {
    id: crm.id,
    nameFr: crm.nameFr,
    nameAr: crm.nameAr,
    phone: crm.phone,
    wilayaCode: crm.wilayaCode,
    address: crm.address,
    riskLevel: crm.riskLevel,
    fraudScore: crm.fraudScore,
    riskSignals: [],
    blacklisted: crm.blacklisted,
    lastDelivery: null,
  };
}

/**
 * Fully enrich an OMS order with PIM product data and CRM customer data.
 * Returns the same response shape the frontend expects.
 */
function enrichOrder(order) {
  const customer = enrichOrderCustomer(order);
  return {
    ...order,
    items: enrichOrderItems(order.items),
    // Top-level fields enriched from CRM (backward-compatible shape)
    customerNameFr: customer.nameFr,
    customerNameAr: customer.nameAr,
    riskLevel: customer.riskLevel,
    fraudScore: customer.fraudScore,
    riskSignals: customer.riskSignals,
    // Nested customer object (canonical shape)
    customer,
  };
}

// ─── Catalogue gate (RULE 2) ────────────────────────────────────────────────

/**
 * Validate that every line item's product is published in Catalogue.
 * Returns { valid: true } or { valid: false, errors: [...] }.
 */
function validateOrderAgainstCatalogue(items) {
  const catalogue = catalogueEntries();
  const errors = [];

  for (const item of items) {
    const entry = catalogue.find(
      (e) => e.sku === item.sku || e.productId === item.productId,
    );
    if (!entry) {
      // Product not in catalogue at all — resolve name from PIM for error message
      const product = resolveProduct(item.sku, item.productId);
      const name = product?.nameFr ?? item.sku;
      errors.push({
        sku: item.sku,
        productId: item.productId,
        message: `Produit non disponible a la vente : ${name} n'est pas dans le catalogue.`,
      });
      continue;
    }
    if (entry.status !== 'published' && entry.status !== 'partial') {
      const product = resolveProduct(item.sku, item.productId);
      const name = product?.nameFr ?? entry.nameFr ?? item.sku;
      errors.push({
        sku: item.sku,
        productId: item.productId,
        status: entry.status,
        message: `Produit non disponible a la vente : ${name} n'est pas publie dans le catalogue.`,
      });
    }
  }

  return errors.length === 0
    ? { valid: true, errors: [] }
    : { valid: false, errors };
}

// ─── Inventory side effects (RULE 3) ────────────────────────────────────────

/**
 * Deduct stock from inventory when order reaches DeliveredCOD_Confirmed.
 * Consumes FIFO layers per business rules.
 */
function deductStockForOrder(order) {
  const inventoryItems = require('../mocks/inventory.mock').inventoryItems;

  for (const item of order.items || []) {
    const inv = inventoryItems.find((i) => i.sku === item.sku);
    if (!inv) continue;
    const qty = item.quantity ?? item.qty ?? 1;
    inv.stock = Math.max((inv.stock ?? 0) - qty, 0);

    // Consume FIFO layers
    let remaining = qty;
    for (const layer of inv.fifoLayers) {
      if (remaining <= 0) break;
      const consume = Math.min(layer.quantityRemaining, remaining);
      layer.quantityRemaining -= consume;
      remaining -= consume;
    }
    // Remove depleted layers
    inv.fifoLayers = inv.fifoLayers.filter((l) => l.quantityRemaining > 0);
    inv.lastMovementAt = new Date().toISOString();
  }
}

/**
 * Move returned items to quarantine when order reaches Returned.
 * Stock goes to quarantine — NOT directly back to available.
 */
function quarantineStockForOrder(order) {
  const inventoryItems = require('../mocks/inventory.mock').inventoryItems;

  for (const item of order.items || []) {
    const inv = inventoryItems.find((i) => i.sku === item.sku);
    if (!inv) continue;
    const qty = item.quantity ?? item.qty ?? 1;
    inv.quantityQuarantined = (inv.quantityQuarantined ?? 0) + qty;
    inv.lastMovementAt = new Date().toISOString();
  }
}

// ─── Stock split computation (RULE 3) ───────────────────────────────────────

const HARD_RESERVATION_STATUSES = ['Confirmed', 'AwaitingPickup', 'HandedToCarrier', 'OutForDelivery'];
const SOFT_RESERVATION_STATUSES = ['AwaitingValidation'];

/**
 * Compute soft/hard stock reservation split from OMS orders.
 * Reservations are DERIVED, not stored.
 */
function computeStockSplit(productSku, inventoryItem) {
  const orders = omsOrders();

  const hardReserved = orders
    .filter((o) => HARD_RESERVATION_STATUSES.includes(o.status))
    .flatMap((o) => o.items || [])
    .filter((item) => item.sku === productSku)
    .reduce((sum, item) => sum + (item.quantity ?? item.qty ?? 0), 0);

  const softReserved = orders
    .filter((o) => SOFT_RESERVATION_STATUSES.includes(o.status))
    .flatMap((o) => o.items || [])
    .filter((item) => item.sku === productSku)
    .reduce((sum, item) => sum + (item.quantity ?? item.qty ?? 0), 0);

  return {
    totalStock: inventoryItem.stock ?? 0,
    hardReserved,
    softReserved,
    available: Math.max((inventoryItem.stock ?? 0) - hardReserved - softReserved, 0),
  };
}

// ─── PIM enrichment for Inventory items ─────────────────────────────────────

/**
 * Enrich an inventory item with PIM product master data.
 */
function enrichInventoryItemWithPIM(item) {
  const product = resolveProduct(item.sku, item.productId);
  return {
    ...item,
    nameFr: product?.nameFr ?? 'Produit inconnu',
    nameAr: product?.nameAr ?? '',
    categoryId: product?.categoryId ?? '',
    supplierName: product?.supplierName ?? '',
    supplierRef: product?.supplierRef ?? '',
    barcode: product?.barcode ?? '',
    salePriceTTC: product?.priceTTC ?? 0,
    costFifo: product?.costFifo ?? item.costFifo ?? 0,
  };
}

// ─── PIM enrichment for Catalogue entries ───────────────────────────────────

/**
 * Enrich a catalogue entry with PIM product master data.
 */
function enrichCatalogueEntryWithPIM(entry) {
  const product = resolveProduct(entry.sku, entry.productId);
  return {
    ...entry,
    nameFr: product?.nameFr ?? 'Produit inconnu',
    nameAr: product?.nameAr ?? '',
    priceTTC: product?.priceTTC ?? 0,
  };
}

// ─── Rapport live computation ───────────────────────────────────────────────

/**
 * Compute Rapport overview metrics LIVE from all module mocks.
 * Replaces any pre-computed values in rapports.mock.js.
 */
function computeRapportOverview() {
  const orders = omsOrders();
  const inventory = require('../mocks/inventory.mock').inventoryItems;

  const deliveredStatuses = ['DeliveredCOD_Confirmed', 'COD_Remitted'];
  const failStatuses = ['DeliveryFailed_Absent', 'ReturnInTransit_Refused', 'LostInTransit', 'Returned'];

  const delivered = orders.filter((o) => deliveredStatuses.includes(o.status));
  const failed = orders.filter((o) => failStatuses.includes(o.status));

  const totalRevenueTTC = delivered.reduce((s, o) => s + (o.totalTTC || 0), 0);
  const totalOrders = orders.length;
  const deliveryRate = (delivered.length + failed.length) > 0
    ? delivered.length / (delivered.length + failed.length)
    : 0;
  const returned = orders.filter((o) => o.status === 'Returned');
  const returnRate = totalOrders > 0 ? returned.length / totalOrders : 0;
  const avgOrderValueTTC = delivered.length > 0
    ? Math.round(totalRevenueTTC / delivered.length)
    : 0;
  const codRemitted = orders.filter((o) => o.status === 'COD_Remitted');
  const codCollectionRate = delivered.length > 0
    ? codRemitted.length / delivered.length
    : 0;

  // Top wilaya by order count
  const wilayaMap = {};
  orders.forEach((o) => {
    if (!o.wilayaCode) return;
    wilayaMap[o.wilayaCode] = (wilayaMap[o.wilayaCode] || 0) + 1;
  });
  const topWilayaCode = Object.entries(wilayaMap)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    period: { from: new Date(Date.now() - 30 * 86400000).toISOString(), to: new Date().toISOString() },
    totalRevenueTTC,
    totalOrders,
    deliveryRate: Math.round(deliveryRate * 100) / 100,
    returnRate: Math.round(returnRate * 100) / 100,
    avgOrderValueTTC,
    codCollectionRate: Math.round(codCollectionRate * 100) / 100,
    topWilaya: topWilayaCode
      ? { code: topWilayaCode[0], name: topWilayaCode[0], orders: topWilayaCode[1] }
      : null,
  };
}

module.exports = {
  resolveProduct,
  resolveCustomer,
  enrichOrder,
  enrichOrderItem,
  enrichOrderItems,
  enrichOrderCustomer,
  validateOrderAgainstCatalogue,
  deductStockForOrder,
  quarantineStockForOrder,
  computeStockSplit,
  enrichInventoryItemWithPIM,
  enrichCatalogueEntryWithPIM,
  computeRapportOverview,
  HARD_RESERVATION_STATUSES,
  SOFT_RESERVATION_STATUSES,
};
