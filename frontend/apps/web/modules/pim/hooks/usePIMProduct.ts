'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';

export const usePIMProduct = (id: string) => {
  return useQuery({
    queryKey: ['pim', 'product', id],
    queryFn: () =>
      fetchBFF<ApiResponse<Product>>(`/bff/pim/${id}`),
    enabled: Boolean(id),
  });
};