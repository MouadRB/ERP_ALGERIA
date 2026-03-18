'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Order } from '@ferza/shared';

export const useOMSOrder = (id: string) => {
  return useQuery({
    queryKey: ['oms', 'order', id],
    queryFn: () =>
      fetchBFF<ApiResponse<Order>>(`/bff/oms/${id}`),
    enabled: Boolean(id),
  });
};