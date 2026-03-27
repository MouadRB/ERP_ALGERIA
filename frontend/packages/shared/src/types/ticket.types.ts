import type { RiskLevel } from './customer.types';

export type TicketCategory =
  | 'Retard de livraison'
  | 'Colis endommagé'
  | 'Produit non conforme'
  | 'Annulation demandée'
  | 'Remboursement'
  | 'Problème de paiement'
  | 'Autre';

export type TicketStatus =
  | 'Ouvert'
  | 'En cours'
  | 'En attente client'
  | 'Escaladé'
  | 'Résolu'
  | 'Fermé';

export type TicketPriority = 'Faible' | 'Normale' | 'Haute' | 'Critique';

export interface Ticket {
  id: string;
  customerId: string;
  customerPhone: string;
  customerNameFr: string;
  customerWilayaCode: string;
  orderId: string | null;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string;
  agentId: string | null;
  agentName: string | null;
  escalated: boolean;
  lastAction: string | null;
  notes: Array<{ content: string; createdAt: string; author: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface RiskFactor {
  name: string;
  weight: number;          // percentage 0–100
  level: RiskLevel;
  value: number;           // computed value 0–100
  description: string;
}

export interface RiskProfile {
  customerId: string;
  score: number;           // 0–100
  level: RiskLevel;
  description: string;
  tendency: 'improving' | 'stable' | 'worsening';
  factors: RiskFactor[];
  recommendations: string[];
  computedAt: string;
}
