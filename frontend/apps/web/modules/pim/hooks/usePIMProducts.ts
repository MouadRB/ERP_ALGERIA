'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';

interface UsePIMProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export const usePIMProducts = (params: UsePIMProductsParams = {}) => {
  return useQuery({
    queryKey: ['pim', 'products', params],
    queryFn: () =>
      fetchBFF<ApiResponse<Product[]>>('/bff/pim', { params }),
  });
};