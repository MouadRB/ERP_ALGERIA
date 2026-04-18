'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF, type ParamValue } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { InventoryItem } from '../inventory.types';

interface UseInventoryStockParams {
  page?: number;
  pageSize?: number;
  search?: string;
  stockStatus?: string;
  categoryId?: string;
  sort?: string;
}

export const useInventoryStock = (params: UseInventoryStockParams = {}) =>
  useQuery({
    queryKey: ['inventory', 'stock', params],
    queryFn: () => fetchBFF<ApiResponse<InventoryItem[]>>('/bff/inventory', { params: params as Record<string, ParamValue> }),
  });
