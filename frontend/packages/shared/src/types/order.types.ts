import type { OrderState } from '../constants/orderStates';
import type { Carrier } from '../constants/carriers';
import type { WilayaCode } from '../constants/wilayas';

export interface OrderItem {
  productId: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  quantity: number;
  unitPriceHT: number;   // DZD, before TVA
  unitPriceTTC: number;  // DZD, after TVA
  tvaRate: 'standard' | 'reduced' | 'exempt';
}

export interface Order {
  id: string;
  reference: string;            // e.g. "ORD-2025-00001"
  customerPhone: string;        // Primary identifier (Algerian mobile)
  customerNameFr: string;
  customerNameAr: string;
  wilayaCode: WilayaCode;
  address: string;
  items: OrderItem[];
  totalHT: number;              // DZD
  totalTVA: number;             // DZD
  totalTTC: number;             // DZD
  codAmount: number;            // Amount to collect on delivery (DZD)
  status: OrderState;
  carrier: Carrier | null;
  deliveryAttempts: number;     // 0–3, max MAX_DELIVERY_ATTEMPTS
  autoCancelAt: string | null;  // ISO 8601 — null until Confirmed
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fraudScore: number | null;    // 0.0–1.0, null before scoring
  createdBy: string;            // userId
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
  revenueRecognizedAt: string | null; // Set at DeliveredCOD_Confirmed
}