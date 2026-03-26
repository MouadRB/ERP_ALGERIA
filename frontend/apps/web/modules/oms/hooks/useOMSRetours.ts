'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';

/* ── Types ─────────────────────────────────────────────── */

/** Return reason categories for chip color mapping */
export type RaisonCategory =
  | 'refus_prix'
  | 'mauvaise_taille'
  | 'endommage'
  | 'absent_x3'
  | 'ne_correspond_pas';

/** Reception state keys for action button + chip mapping */
export type EtatReceptionKey = 'quarantaine' | 'transit';

/** Litige severity for card border color */
export type LitigeSeverity = 'high' | 'medium' | 'low';

/** Litige status key for internal mapping */
export type LitigeStatusKey = 'attente_carrier' | 'finance_notifie' | 'resolu';

export interface RetourItem {
  id: string;
  orderRef: string;
  orderId: string;
  customerPhone: string;
  customerNameFr: string;
  produit: string;
  produitQty: number;
  carrier: string;
  trackingNumber: string;
  raisonRetour: string;
  raisonCategory: RaisonCategory;
  etatReception: string;
  etatReceptionKey: EtatReceptionKey;
  returnedAt: string;
  inspectedAt: string | null;
}

export interface LitigeItem {
  id: string;
  orderRef: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  severity: LitigeSeverity;
  description: string;
  customerPhone: string;
  wilaya: string;
  openedAt: string;
  status: string;
  statusKey: LitigeStatusKey;
  assignedTo: string | null;
  actionLabel: string;
}

export interface RetoursLitigesData {
  totalRetours: number;
  totalLitiges: number;
  retours: RetourItem[];
  litiges: LitigeItem[];
}

interface RetoursResponse {
  data: RetoursLitigesData;
}

/* ── Hook ──────────────────────────────────────────────── */

export const useOMSRetours = () =>
  useQuery<RetoursResponse>({
    queryKey: ['oms', 'retours'],
    queryFn: () => fetchBFF<RetoursResponse>('/bff/oms/retours'),
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  });
