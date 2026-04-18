'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { InventoryItem } from '../inventory.types';

export const useInventorySKU = (sku: string) =>
  useQuery({
    queryKey: ['inventory', 'sku', sku],
    queryFn: () => fetchBFF<ApiResponse<InventoryItem>>(`/bff/inventory/${sku}`),
    enabled: Boolean(sku),
  });
