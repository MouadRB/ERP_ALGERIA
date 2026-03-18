'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, InventoryItem } from '@ferza/shared';

interface UseInventoryStockParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const useInventoryStock = (params: UseInventoryStockParams = {}) => {
  return useQuery({
    queryKey: ['inventory', 'stock', params],
    queryFn: () =>
      fetchBFF<ApiResponse<InventoryItem[]>>('/bff/inventory', { params }),
  });
};