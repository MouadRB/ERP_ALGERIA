'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';

/* ── Period options ────────────────────────────────────── */

export type AnalyticsPeriod = 'today' | '7d' | '30d' | '90d';

export const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d',    label: '7 derniers jours' },
  { value: '30d',   label: '30 derniers jours' },
  { value: '90d',   label: '90 derniers jours' },
];

/* ── Types ─────────────────────────────────────────────── */

export interface VolumeDay {
  date: string;
  total: number;
  confirmees: number;
  livrees: number;
}

export interface VolumeData {
  data: VolumeDay[];
  maxDay: { date: string; total: number };
  minDay: { date: string; total: number; label: string };
  croissance: number;
}

export interface OperateurRow {
  name: string;
  appelees: number;
  confirmees: number;
  tauxConfirmation: number;
}

export interface OperateursData {
  teamAvgTauxConfirmation: number;
  data: OperateurRow[];
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export interface CarrierTauxRow {
  name: string;
  taux: number;
  color: string;
}

export interface CarrierRepartitionData {
  totalEnvoisActifs: number;
  donut: DonutSlice[];
  tauxLivraison: CarrierTauxRow[];
}

export interface WilayaRow {
  code: string;
  name: string;
  count: number;
}

export interface WilayasData {
  totalWilayasActives: number;
  data: WilayaRow[];
}

export interface AnnulationRow {
  raison: string;
  count: number;
  color: string;
}

export interface AnnulationsData {
  totalAnnulations: number;
  autoExpire: number;
  data: AnnulationRow[];
}

export interface AnalyticsPayload {
  period: string;
  volume: VolumeData;
  operateurs: OperateursData;
  carrierRepartition: CarrierRepartitionData;
  wilayas: WilayasData;
  annulations: AnnulationsData;
}

interface AnalyticsResponse {
  data: AnalyticsPayload;
}

/* ── Hook ──────────────────────────────────────────────── */

export const useOMSAnalytics = (period: AnalyticsPeriod = '7d') =>
  useQuery({
    queryKey: ['oms', 'analytics', period],
    queryFn: () =>
      fetchBFF<AnalyticsResponse>('/bff/oms/analytics', {
        params: { period },
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000, // analytics data is less volatile, 5 min stale
  });