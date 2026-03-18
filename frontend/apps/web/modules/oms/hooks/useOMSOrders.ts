'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Order } from '@ferza/shared';

interface UseOMSOrdersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export const useOMSOrders = (params: UseOMSOrdersParams = {}) => {
  return useQuery({
    queryKey: ['oms', 'orders', params],
    queryFn: () =>
      fetchBFF<ApiResponse<Order[]>>('/bff/oms', { params }),
  });
};