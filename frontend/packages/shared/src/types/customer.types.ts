import type { WilayaCode } from '../constants/wilayas';

export type CustomerSegment = 'VIP' | 'Fidèle' | 'Nouveau' | 'Inactif' | 'A risque' | 'Liste noire';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BlacklistMotif =
  | 'Refus répété à la livraison'
  | 'Fraude / tentative d\'arnaque'
  | 'Adresse fausse répétée'
  | 'Comportement abusif envers les livreurs'
  | 'Commandes multiples frauduleuses'
  | 'Non-paiement répété'
  | 'Doublon frauduleux';

export interface Customer {
  id: string;
  phone: string;                         // Primary identifier — Algerian mobile 0[567]XXXXXXXX
  phoneSec: string | null;               // Secondary phone
  nameFr: string;
  nameAr: string;
  email: string | null;
  wilayaCode: WilayaCode;
  commune: string | null;
  address: string;
  segment: CustomerSegment;
  blacklisted: boolean;
  blacklistReason: string | null;
  blacklistMotif: BlacklistMotif | null;
  blacklistedAt: string | null;
  blacklistedBy: string | null;
  preferredChannel: 'telephone' | 'whatsapp' | 'both' | null;
  preferredLanguage: 'darija' | 'français' | 'arabe' | null;
  riskLevel: RiskLevel;
  fraudScore: number | null;             // 0–100

  // Computed metrics — derived from OMS orders at BFF query time
  totalOrders: number;
  totalSpentTTC: number;                 // DZD lifetime (delivered orders only)
  panierMoyen: number | null;            // totalSpentTTC / deliveredCount
  tauxRetour: number | null;             // 0–100 percentage
  tauxAnnulation: number | null;         // 0–100 percentage
  lastOrderDate: string | null;
  lastOrderRef: string | null;
  lastOrderStatus: string | null;
  deliveredCount: number;
  cancelledCount: number;
  returnedCount: number;

  createdAt: string;
  updatedAt: string;
}
