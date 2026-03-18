'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export const useOMSAnalytics = () => {
  return useQuery({
    queryKey: ['oms', 'analytics'],
    queryFn: () =>
      fetchBFF<ApiResponse<unknown>>('/bff/rapports', {
        params: { module: 'oms' },
      }),
  });
};