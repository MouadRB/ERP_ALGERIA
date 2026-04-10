'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { Order } from '@ferza/shared';

interface OrdersResponse {
  data: Order[];
  meta: { total: number; page: number; pageSize: number };
}

export const useOMSQueue = () =>
  useQuery({
    queryKey:        ['oms', 'queue'],
    queryFn:         () =>
      fetchBFF<OrdersResponse>('/bff/oms', {
        params: { status: 'AwaitingValidation', pageSize: 50 },
      }),
    refetchInterval: 30_000,
  });