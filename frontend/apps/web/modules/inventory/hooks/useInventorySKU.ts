'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, InventoryItem } from '@ferza/shared';

export const useInventorySKU = (sku: string) => {
  return useQuery({
    queryKey: ['inventory', 'sku', sku],
    queryFn: () =>
      fetchBFF<ApiResponse<InventoryItem>>(`/bff/inventory/${sku}`),
    enabled: Boolean(sku),
  });
};