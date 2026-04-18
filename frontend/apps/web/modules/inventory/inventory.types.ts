export interface InventoryReservation {
  reservationId: string;
  orderId: string;
  quantity: number;
  reservedAt: string;
  type: 'soft' | 'hard';
  clientPhone?: string;
  city?: string;
  statusOms?: string;
  expiresAt?: string | null;
  actionLabel?: string;
}

export interface InventoryReturn {
  returnId: string;
  orderId: string;
  quantity: number;
  quality: string;
  status: string;
  clientPhone?: string;
  returnedAt?: string;
  reason?: string;
  inspectionStatus?: 'pending' | 'approved' | 'rejected';
  productState?: string;
}

export interface InventoryFifoLayer {
  layerId: string;
  receivedAt: string;
  quantityInitial: number;
  quantityRemaining: number;
  unitCostHT: number;
}

export interface InventoryMovement {
  id: string;
  sku: string;
  type: string;
  quantity: number;
  unitCostHT: number | null;
  referenceId: string | null;
  performedBy: string;
  createdAt: string;
  description: string;
  note?: string;
}

export interface InventoryItem {
  sku: string;
  productId: string;
  nameFr: string;
  nameAr: string;
  categoryId: string;
  supplierName: string;
  supplierRef: string;
  mdmRef?: string;
  barcode?: string;
  salePriceTTC?: number;
  imageUrl?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityQuarantined: number;
  softReserved: number;
  hardReserved: number;
  reorderPoint: number;
  costFifo: number;
  stockValue: number;
  availableValue: number;
  weightedAverageCost: number;
  fifoLayers: InventoryFifoLayer[];
  reservations: InventoryReservation[];
  returns: InventoryReturn[];
  alerts: string[];
  suggestedReorderQty: number;
  lastMovementAt: string | null;
  movements?: InventoryMovement[];
}

export interface InventoryStats {
  stockValue: number;
  units: number;
  ruptures: number;
  lowStock: number;
  movementsToday: number;
  movementsTodaySplit: { incoming: number; outgoing: number };
}
