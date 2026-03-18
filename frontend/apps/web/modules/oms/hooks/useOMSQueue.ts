'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Order } from '@ferza/shared';


export const useOMSQueue = () => {
  return useQuery({
    queryKey: ['oms', 'queue'],
    queryFn: () =>
      fetchBFF<ApiResponse<Order[]>>('/bff/oms', {
        params: { status: 'AwaitingValidation', pageSize: 50 },
      }),
    refetchInterval: 30_000, // Poll every 30s — queue is time sensitive
  });
};