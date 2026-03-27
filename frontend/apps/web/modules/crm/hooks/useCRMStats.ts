'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';

export interface CRMStats {
  totalCustomers:   number;
  activeCount:      number;
  wilayaCount:      number;
  vipCount:         number;
  vipAvgCA:         number;
  fideleCount:      number;
  newThisMonth:     number;
  conversionRate:   number;
  nouveauCount:     number;
  inactifCount:     number;
  aRisqueCount:     number;
  blacklistedCount: number;
  blacklistedToday: number;
  openTicketsCount: number;
  escalatedCount:   number;
}

export const useCRMStats = () =>
  useQuery({
    queryKey: ['crm', 'stats'],
    queryFn:  () => fetchBFF<{ data: CRMStats }>('/bff/crm/stats'),
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  });
