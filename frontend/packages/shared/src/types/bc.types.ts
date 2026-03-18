import type { BCState } from '../constants/bcStates';
import type { WilayaCode } from '../constants/wilayas';

export interface BCItem {
  productId: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPriceHT: number;   // DZD
  tvaRate: 'standard' | 'reduced' | 'exempt';
}

export interface BonCommande {
  id: string;
  reference: string;           // e.g. "BC-2025-00001"
  supplierId: string;
  supplierName: string;
  wilayaCode: WilayaCode;
  items: BCItem[];
  totalHT: number;             // DZD
  totalTVA: number;            // DZD
  totalTTC: number;            // DZD
  status: BCState;
  createdBy: string;           // userId — SoD: must differ from approvedBy
  approvedBy: string | null;   // userId — only SUPERADMIN or FINANCE_DIRECTOR
  rejectedBy: string | null;
  rejectionReason: string | null;
  autoCancelAt: string | null; // ISO 8601, pauses outside business hours
  expectedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
}