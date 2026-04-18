'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { InventoryMovement } from '../inventory.types';

export const useStockMovements = (sku?: string) =>
  useQuery({
    queryKey: ['inventory', 'movements', sku],
    queryFn: () =>
      fetchBFF<ApiResponse<InventoryMovement[]>>('/bff/inventory/movements', {
        params: sku ? { sku } : {},
      }),
  });
