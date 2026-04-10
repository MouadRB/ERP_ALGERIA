'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';

export interface SegmentPoint  { segment: string; count: number; }
export interface WilayaDelivery { wilayaCode: string; deliveryRate: number; totalOrders: number; }
export interface ReturnRatePoint { week: string; rate: number; }
export interface TopClient {
  id: string; nameFr: string; wilayaCode: string;
  totalSpentTTC: number; totalOrders: number; segment: string;
}
export interface InsatisfactionReason { reason: string; count: number; }

export interface CRMAnalytics {
  period:               string;
  segmentation:         SegmentPoint[];
  wilayaDelivery:       WilayaDelivery[];
  returnRateWeekly:     ReturnRatePoint[];
  topClients:           TopClient[];
  insatisfactionReasons: InsatisfactionReason[];
}

export const useCRMAnalytics = (period = '30d') =>
  useQuery({
    queryKey: ['crm', 'analytics', period],
    queryFn:  () => fetchBFF<{ data: CRMAnalytics }>('/bff/crm/analytics', { params: { period } }),
    placeholderData: (prev) => prev,
  });
