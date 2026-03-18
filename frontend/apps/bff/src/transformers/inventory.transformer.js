const transformInventoryItem = (raw) => ({
  sku: raw.sku,
  productId: raw.productId,
  nameFr: raw.nameFr ?? raw.name,
  nameAr: raw.nameAr ?? '',
  warehouseId: raw.warehouseId,
  quantityOnHand: raw.quantityOnHand ?? raw.onHand ?? 0,
  quantityReserved: raw.quantityReserved ?? raw.reserved ?? 0,
  quantityAvailable: raw.quantityAvailable ?? (raw.onHand - raw.reserved) ?? 0,
  quantityQuarantined: raw.quantityQuarantined ?? 0,
  reorderPoint: raw.reorderPoint ?? 0,
  fifoLayers: (raw.fifoLayers ?? []).map((layer) => ({
    layerId: layer.layerId ?? layer.id,
    receivedAt: layer.receivedAt,
    quantityInitial: layer.quantityInitial,
    quantityRemaining: layer.quantityRemaining,
    unitCostHT: layer.unitCostHT ?? layer.costHT,
  })),
  reservations: (raw.reservations ?? []).map((r) => ({
    reservationId: r.reservationId ?? r.id,
    orderId: r.orderId,
    quantity: r.quantity,
    reservedAt: r.reservedAt,
  })),
  lastMovementAt: raw.lastMovementAt ?? null,
});

const transformInventoryList = (rawList) => rawList.map(transformInventoryItem);

module.exports = { transformInventoryItem, transformInventoryList };