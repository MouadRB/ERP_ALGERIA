'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';

/* ── Types ─────────────────────────────────────────────── */

export interface CarrierShipment {
  trk: string;
  orderRef: string;
  wilaya: string;
  status: string;
}

export interface CarrierData {
  connected: boolean;
  apiVersion: string | null;
  enTransit: number;
  livres: number;
  echecs: number;
  tauxLivraison: number | null;
  delaiMoyen: number | null;
  wilayas: number | null;
  recentShipments: CarrierShipment[];
  note?: string;
}

export interface SuiviData {
  totalActiveCarriers: number;
  totalShipments: number;
  carriers: Record<string, CarrierData>;
}

interface SuiviResponse {
  data: SuiviData;
}

/* ── Hook ──────────────────────────────────────────────── */

export const useOMSSuivi = () =>
  useQuery<SuiviResponse>({
    queryKey: ['oms', 'suivi'],
    queryFn: () => fetchBFF<SuiviResponse>('/bff/oms/suivi'),
    refetchInterval: 60_000, // refresh every 60s (carrier data changes less often than queue)
    placeholderData: (prev) => prev,
  });
