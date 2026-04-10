'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useRapportsCrossModule = (period = '30d', enabled = true) =>
  useQuery({
    queryKey: ['rapports', 'cross-module', { period }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn:  () => fetchBFF<{ data: any }>('/bff/rapports/cross-module', { params: { period } }),
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
