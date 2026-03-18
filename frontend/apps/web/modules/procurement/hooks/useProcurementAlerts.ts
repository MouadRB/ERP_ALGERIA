'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export const useProcurementAlerts = () => {
  return useQuery({
    queryKey: ['procurement', 'alerts'],
    queryFn: () =>
      fetchBFF<ApiResponse<unknown[]>>('/bff/procurement/alerts'),
    refetchInterval: 60_000,
  });
};