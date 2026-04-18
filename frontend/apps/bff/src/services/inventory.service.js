const env = require('../config/env');
const { inventoryItems, movements } = require('../mocks/inventory.mock');
const omsOrders = require('../mocks/oms-orders.mock');
const { AppError } = require('../errors/AppError');
const { enrichInventoryItemWithPIM } = require('./cross-module.helpers');

const paginate = (rows, page = 1, pageSize = 20) => {
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return {
    data: rows.slice(start, start + pageSize),
    meta: { total, page, pageSize },
  };
};

const SOFT_RESERVATION_STATUSES = new Set(['AwaitingValidation']);
const HARD_RESERVATION_STATUSES = new Set([
  'Confirmed',
  'AwaitingPickup',
  'HandedToCarrier',
  'OutForDelivery',
]);

// Derive soft/hard reservations for a SKU from the OMS orders mock.
// OMS is the single source of truth for reservations.
const getReservationsForSku = (sku) => {
  const reservations = [];
  omsOrders.forEach((order) => {
    const status = order.status;
    const type = SOFT_RESERVATION_STATUSES.has(status)
      ? 'soft'
      : HARD_RESERVATION_STATUSES.has(status)
        ? 'hard'
        : null;
    if (!type) return;
    (order.items || []).forEach((line) => {
      if (line.sku !== sku) return;
      reservations.push({
        reservationId: `RES-${order.id}-${line.sku}`,
        orderId: order.reference || order.id,
        quantity: line.quantity || line.qty || 0,
        reservedAt: order.createdAt || order.updatedAt || null,
        type,
        clientPhone: order.customer?.phone || order.customerPhone || '',
        city: order.customer?.wilaya || '',
        statusOms: status,
        expiresAt: order.autoCancelAt || null,
        actionLabel: type === 'soft' ? 'Voir commande' : 'Voir WMS',
      });
    });
  });
  return reservations;
};

const summarizeReservations = (reservations) => {
  let soft = 0;
  let hard = 0;
  reservations.forEach((entry) => {
    if (entry.type === 'soft') soft += entry.quantity;
    else if (entry.type === 'hard') hard += entry.quantity;
  });
  return { soft, hard, total: soft + hard };
};

const enrichItem = (item) => {
  // SYNC-4: inject PIM-owned fields (nameFr, nameAr, categoryId, etc.)
  const pimEnriched = enrichInventoryItemWithPIM(item);

  const reservations = getReservationsForSku(pimEnriched.sku);
  const { soft, hard, total: reservedTotal } = summarizeReservations(reservations);
  const quantityOnHand = pimEnriched.stock ?? 0;
  const quantityAvailable = Math.max(quantityOnHand - reservedTotal, 0);
  const itemMovements = movements
    .filter((movement) => movement.sku === pimEnriched.sku)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    ...pimEnriched,
    quantityOnHand,
    quantityReserved: reservedTotal,
    quantityAvailable,
    softReserved: soft,
    hardReserved: hard,
    reservations,
    stockValue: quantityOnHand * (pimEnriched.costFifo || 0),
    availableValue: quantityAvailable * (pimEnriched.costFifo || 0),
    weightedAverageCost: pimEnriched.fifoLayers.length
      ? Math.round(
          pimEnriched.fifoLayers.reduce(
            (sum, layer) => sum + layer.quantityRemaining * layer.unitCostHT,
            0,
          ) /
            Math.max(
              1,
              pimEnriched.fifoLayers.reduce((sum, layer) => sum + layer.quantityRemaining, 0),
            ),
        )
      : (pimEnriched.costFifo || 0),
    movements: itemMovements,
  };
};

const compareBySort = (left, right, sort) => {
  if (sort === 'stock-asc') return left.quantityAvailable - right.quantityAvailable;
  if (sort === 'stock-desc') return right.quantityAvailable - left.quantityAvailable;
  if (sort === 'value-desc') return right.stockValue - left.stockValue;
  if (sort === 'turnover') return right.quantityReserved - left.quantityReserved;
  if (sort === 'updated') {
    return String(right.lastMovementAt || '').localeCompare(String(left.lastMovementAt || ''));
  }
  return String(left.nameFr).localeCompare(String(right.nameFr));
};

const getStock = async ({
  page = 1,
  pageSize = 20,
  search,
  stockStatus,
  categoryId,
  sort = 'stock-desc',
} = {}) => {
  if (!env.useMock) {
    const res = await fetch(`${env.engineAUrl}/api/inventory?page=${page}&pageSize=${pageSize}`);
    if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
    const json = await res.json();
    return { data: json.data ?? json, meta: json.meta };
  }

  let rows = inventoryItems.map(enrichItem);

  if (categoryId) rows = rows.filter((item) => item.categoryId === categoryId);

  if (stockStatus === 'rupture') rows = rows.filter((item) => item.quantityAvailable <= 0);
  if (stockStatus === 'faible') {
    rows = rows.filter(
      (item) => item.quantityAvailable > 0 && item.quantityAvailable <= item.reorderPoint,
    );
  }
  if (stockStatus === 'disponible') {
    rows = rows.filter((item) => item.quantityAvailable > item.reorderPoint);
  }
  if (stockStatus === 'reserve') rows = rows.filter((item) => item.quantityReserved > 0);

  if (search) {
    const query = search.toLowerCase();
    rows = rows.filter((item) =>
      [item.nameFr, item.nameAr, item.sku, item.supplierName, item.barcode, item.mdmRef]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  rows.sort((left, right) => compareBySort(left, right, sort));

  return paginate(rows, page, pageSize);
};

const getStockBySKU = async (sku) => {
  if (!env.useMock) {
    const res = await fetch(`${env.engineAUrl}/api/inventory/${sku}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Engine A error: ${res.status}`);
    return res.json();
  }

  const item = inventoryItems.find((inventoryItem) => inventoryItem.sku === sku);
  if (!item) return null;
  return enrichItem(item);
};

const getAlerts = async () =>
  inventoryItems
    .map(enrichItem)
    .filter(
      (item) =>
        item.quantityAvailable <= item.reorderPoint ||
        item.quantityAvailable <= 0 ||
        item.quantityQuarantined > 0,
    )
    .sort((left, right) => left.quantityAvailable - right.quantityAvailable);

const getMovements = async ({ sku } = {}) => {
  if (!sku) return [...movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return movements
    .filter((movement) => movement.sku === sku)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

const getFifoLayers = async (sku) => {
  const item = inventoryItems.find((inventoryItem) => inventoryItem.sku === sku);
  return item?.fifoLayers ?? [];
};

const pushMovement = (movement) => {
  const record = {
    id: `MOV-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...movement,
  };
  movements.unshift(record);
  return record;
};

// Allowed movement types in MVP: receipt, sale, return, quarantine, physicalInventory.
// Transfer and generic adjustment are explicitly out of scope.
const ALLOWED_MOVEMENT_TYPES = new Set([
  'receipt',
  'sale',
  'return',
  'quarantine',
  'physicalInventory',
]);

const createMovement = async ({
  sku,
  type,
  quantity,
  reason,
  unitCostHT,
  referenceId,
}) => {
  if (!ALLOWED_MOVEMENT_TYPES.has(type)) {
    throw new AppError('INVALID_TYPE', `Type de mouvement non supporte: ${type}`, 400);
  }
  const item = inventoryItems.find((inventoryItem) => inventoryItem.sku === sku);
  if (!item) throw new AppError('NOT_FOUND', 'SKU introuvable.', 404);

  const enrichedBefore = enrichItem(item);
  const amount = Math.abs(Number(quantity) || 0);
  if (amount <= 0) {
    throw new AppError('INVALID_QUANTITY', 'La quantite doit etre superieure a zero.', 400);
  }

  const unitCost = Number(unitCostHT ?? enrichedBefore.costFifo ?? 0);

  if (type === 'sale') {
    if (amount > enrichedBefore.quantityAvailable) {
      throw new AppError(
        'INSUFFICIENT_STOCK',
        `Opération annulée : la quantité de sortie (${amount} unités) dépasse le stock disponible (${enrichedBefore.quantityAvailable} unités).`,
        400,
      );
    }
    item.stock = Math.max((item.stock ?? 0) - amount, 0);
    pushMovement({
      sku,
      type: 'sale',
      quantity: -amount,
      unitCostHT: unitCost,
      referenceId: referenceId || reason || 'Sortie',
      performedBy: 'Inventory Manager',
      description: reason || 'Sortie de stock',
    });
  } else if (type === 'receipt') {
    item.stock = (item.stock ?? 0) + amount;
    item.fifoLayers.unshift({
      layerId: `FIFO-${Date.now()}`,
      receivedAt: new Date().toISOString(),
      quantityInitial: amount,
      quantityRemaining: amount,
      unitCostHT: unitCost,
    });
    pushMovement({
      sku,
      type: 'receipt',
      quantity: amount,
      unitCostHT: unitCost,
      referenceId: referenceId || reason || 'Reception',
      performedBy: 'Inventory Manager',
      description: reason || 'Reception de stock',
    });
  } else if (type === 'return') {
    item.stock = (item.stock ?? 0) + amount;
    item.quantityQuarantined = (item.quantityQuarantined ?? 0) + amount;
    if (!item.returns) item.returns = [];
    item.returns.unshift({
      returnId: `RET-${item.sku}-${Date.now()}`,
      orderId: referenceId || reason || 'Retour',
      quantity: amount,
      quality: reason || 'Retour client',
      status: 'Quarantaine',
      clientPhone: '',
      returnedAt: new Date().toISOString(),
      reason: reason || 'Retour client',
      inspectionStatus: 'pending',
      productState: 'En attente inspection',
    });
    pushMovement({
      sku,
      type: 'return',
      quantity: amount,
      unitCostHT: unitCost,
      referenceId: referenceId || reason || 'Retour',
      performedBy: 'Logistics Agent',
      description: reason || 'Retour client — mis en quarantaine',
    });
  } else if (type === 'quarantine') {
    if (amount > enrichedBefore.quantityAvailable) {
      throw new AppError(
        'INSUFFICIENT_STOCK',
        `Quantite a mettre en quarantaine superieure au stock disponible (stock actuel : ${enrichedBefore.quantityAvailable} unites).`,
        400,
      );
    }
    item.stock = Math.max((item.stock ?? 0) - amount, 0);
    item.quantityQuarantined = (item.quantityQuarantined ?? 0) + amount;
    pushMovement({
      sku,
      type: 'quarantine',
      quantity: amount,
      unitCostHT: unitCost,
      referenceId: referenceId || reason || 'Quarantaine',
      performedBy: 'Inventory Manager',
      description: reason || 'Mise en quarantaine',
    });
  } else if (type === 'physicalInventory') {
    // Absolute count: align stock to the counted quantity.
    const counted = Number(quantity);
    if (counted < 0 || Number.isNaN(counted)) {
      throw new AppError('INVALID_QUANTITY', 'Quantite comptee invalide.', 400);
    }
    const delta = counted - (item.stock ?? 0);
    item.stock = counted;
    pushMovement({
      sku,
      type: 'physicalInventory',
      quantity: delta,
      unitCostHT: unitCost,
      referenceId: referenceId || 'Inventaire physique',
      performedBy: 'Inventory Manager',
      description: reason || 'Inventaire physique',
    });
  }

  item.lastMovementAt = new Date().toISOString();
  return enrichItem(item);
};

const quarantineStock = async ({ sku, quantity, reason }) =>
  createMovement({ sku, type: 'quarantine', quantity, reason });

const processReturn = async ({ sku, returnId, decision }) => {
  const item = inventoryItems.find((inventoryItem) => inventoryItem.sku === sku);
  if (!item) return null;

  const returnItem = item.returns.find((entry) => entry.returnId === returnId);
  if (!returnItem) return null;

  const quantity = Math.max(returnItem.quantity, 1);

  // SYNC-4: resolve costFifo from PIM since it's no longer on the raw item
  const pimEnrichedItem = enrichInventoryItemWithPIM(item);
  const itemCostFifo = pimEnrichedItem.costFifo || 0;

  if (decision === 'approve') {
    // Stock already incremented on declaration — no stock change needed.
    // Only exit quarantine and log the approval.
    item.quantityQuarantined = Math.max((item.quantityQuarantined ?? 0) - quantity, 0);
    pushMovement({
      sku,
      type: 'return_approved',
      quantity: 0,
      unitCostHT: itemCostFifo,
      referenceId: returnItem.orderId,
      performedBy: 'Inventory Manager',
      description: `Retour approuve — stock maintenu ${returnItem.orderId}`,
    });
  } else {
    // Rejected: reverse the stock increment from declaration.
    item.stock = Math.max((item.stock ?? 0) - quantity, 0);
    item.quantityQuarantined = Math.max((item.quantityQuarantined ?? 0) - quantity, 0);
    pushMovement({
      sku,
      type: 'return_rejected',
      quantity: -quantity,
      unitCostHT: itemCostFifo,
      referenceId: returnItem.orderId,
      performedBy: 'Inventory Manager',
      description: `Retour rejete — stock decremente ${returnItem.orderId}`,
    });
  }

  item.returns = item.returns.filter((entry) => entry.returnId !== returnId);
  item.lastMovementAt = new Date().toISOString();
  return enrichItem(item);
};

// Pure KPI computation over the whole inventory snapshot + movements + OMS.
// Shape consumed by InventoryMetricsRow.
const computeInventoryStats = (products, movementsList) => {
  const enriched = products.map(enrichItem);
  const stockValue = enriched.reduce((sum, item) => sum + item.stockValue, 0);
  const units = enriched.reduce((sum, item) => sum + item.quantityOnHand, 0);
  const ruptures = enriched.filter((item) => item.quantityAvailable <= 0).length;
  const lowStock = enriched.filter(
    (item) => item.quantityAvailable > 0 && item.quantityAvailable <= item.reorderPoint,
  ).length;

  const today = new Date().toISOString().slice(0, 10);
  const todayMovements = movementsList.filter((movement) =>
    String(movement.createdAt || '').startsWith(today),
  );
  const incoming = todayMovements
    .filter((movement) => movement.quantity > 0)
    .reduce((sum, movement) => sum + movement.quantity, 0);
  const outgoing = todayMovements
    .filter((movement) => movement.quantity < 0)
    .reduce((sum, movement) => sum + Math.abs(movement.quantity), 0);

  return {
    stockValue,
    units,
    ruptures,
    lowStock,
    movementsToday: todayMovements.length,
    movementsTodaySplit: { incoming, outgoing },
  };
};

const getStats = async () => computeInventoryStats(inventoryItems, movements);

// Cross-module stock lookup: used by pim.service and catalogue.service to
// enrich product responses at BFF join time. Returns a plain summary — soft
// and hard reservations are derived from OMS orders. If the product is not
// tracked in Inventory, returns null so the caller can render a "not tracked"
// state rather than fabricate zeros.
const getStockForProduct = ({ sku, productId } = {}) => {
  const item = inventoryItems.find(
    (entry) =>
      (sku && entry.sku === sku) || (productId && entry.productId === productId),
  );
  if (!item) return null;

  const enriched = enrichItem(item);
  return {
    sku: item.sku,
    productId: item.productId,
    quantityOnHand: enriched.quantityOnHand,
    quantityAvailable: enriched.quantityAvailable,
    quantityReserved: enriched.quantityReserved,
    softReserved: enriched.softReserved,
    hardReserved: enriched.hardReserved,
    quantityQuarantined: item.quantityQuarantined ?? 0,
    reorderPoint: item.reorderPoint,
    stockStatus:
      enriched.quantityAvailable <= 0
        ? 'rupture'
        : enriched.quantityAvailable <= item.reorderPoint
          ? 'faible'
          : 'disponible',
    lastMovementAt: item.lastMovementAt ?? null,
  };
};

module.exports = {
  computeInventoryStats,
  createMovement,
  getAlerts,
  getFifoLayers,
  getMovements,
  getStats,
  getStock,
  getStockBySKU,
  getStockForProduct,
  processReturn,
  quarantineStock,
};
