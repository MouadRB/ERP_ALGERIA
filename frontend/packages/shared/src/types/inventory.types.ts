export interface FifoLayer {
  layerId: string;
  receivedAt: string;          // ISO 8601
  quantityInitial: number;
  quantityRemaining: number;
  unitCostHT: number;          // DZD — FIFO costing
}

export interface StockReservation {
  reservationId: string;
  orderId: string;
  quantity: number;
  reservedAt: string;          // ISO 8601
}

export interface InventoryItem {
  sku: string;
  productId: string;
  nameFr: string;
  nameAr: string;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;   // onHand - reserved
  quantityQuarantined: number;
  reorderPoint: number;
  fifoLayers: FifoLayer[];
  reservations: StockReservation[];
  lastMovementAt: string | null;
}

export type MovementType =
  | 'receipt'
  | 'sale'
  | 'return'
  | 'adjustment'
  | 'transfer'
  | 'quarantine'
  | 'write_off';

export interface StockMovement {
  id: string;
  sku: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;            // positive = in, negative = out
  unitCostHT: number | null;   // DZD, null for non-costed movements
  referenceId: string | null;  // orderId, bcId, etc.
  performedBy: string;         // userId
  createdAt: string;
}