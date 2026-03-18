'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, StockMovement } from '@ferza/shared';

export const useStockMovements = (sku?: string) => {
  return useQuery({
    queryKey: ['inventory', 'movements', sku],
    queryFn: () =>
      fetchBFF<ApiResponse<StockMovement[]>>('/bff/inventory/movements', {
        params: sku ? { sku } : {},
      }),
  });
};