'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface RiskProfile {
  customerId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  fraudScore: number;
  flags: string[];
}

export const useRiskProfile = (customerId: string) => {
  return useQuery({
    queryKey: ['crm', 'risk', customerId],
    queryFn: () =>
      fetchBFF<ApiResponse<RiskProfile>>(`/bff/crm/${customerId}/risk`),
    enabled: Boolean(customerId),
  });
};