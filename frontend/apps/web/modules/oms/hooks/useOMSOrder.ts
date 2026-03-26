'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { Order } from '@ferza/shared';

interface OrderResponse {
  data: Order;
}

export const useOMSOrder = (id: string) =>
  useQuery({
    queryKey: ['oms', 'order', id],
    queryFn:  () => fetchBFF<OrderResponse>(`/bff/oms/${id}`),
    enabled:  Boolean(id),
  });