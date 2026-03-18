import type { WilayaCode } from '../constants/wilayas';

export type CustomerSegment = 'standard' | 'vip' | 'wholesale';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Customer {
  id: string;
  phone: string;               // Primary identifier — Algerian mobile 0[567]XXXXXXXX
  nameFr: string;
  nameAr: string;
  email: string | null;        // Optional — phone is primary
  wilayaCode: WilayaCode;
  address: string;
  segment: CustomerSegment;
  blacklisted: boolean;
  blacklistReason: string | null;
  riskLevel: RiskLevel;
  fraudScore: number | null;   // 0.0–1.0
  totalOrders: number;
  totalSpentTTC: number;       // DZD lifetime
  createdAt: string;
  updatedAt: string;
}