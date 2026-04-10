'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, RiskProfile } from '@ferza/shared';

export const useRiskProfile = (customerId: string) =>
  useQuery({
    queryKey: ['crm', 'risk', customerId],
    queryFn:  () => fetchBFF<ApiResponse<RiskProfile>>(`/bff/crm/${customerId}/risk`),
    enabled:  Boolean(customerId),
  });
