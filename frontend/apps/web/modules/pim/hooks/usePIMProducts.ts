'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF, type ParamValue } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { Product } from '../components/pim.types';

interface UsePIMProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  supplier?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const usePIMProducts = (params: UsePIMProductsParams = {}) =>
  useQuery({
    queryKey: ['pim', 'products', params],
    queryFn: () => fetchBFF<ApiResponse<Product[]>>('/bff/pim', { params: params as Record<string, ParamValue> }),
  });
