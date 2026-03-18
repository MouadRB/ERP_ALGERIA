'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
interface RapportsOverview {
  period: { from: string; to: string };
  totalRevenueTTC: number;
  totalOrders: number;
  deliveryRate: number;
  returnRate: number;
  avgOrderValueTTC: number;
  codCollectionRate: number;
  topWilaya: { code: string; name: string; orders: number };
}

interface UseRapportsOverviewParams {
  from?: string;
  to?: string;
}

export const useRapportsOverview = (params: UseRapportsOverviewParams = {}) => {
  return useQuery({
    queryKey: ['rapports', 'overview', params],
    queryFn: () =>
      fetchBFF<ApiResponse<RapportsOverview>>('/bff/rapports', { params }),
  });
};