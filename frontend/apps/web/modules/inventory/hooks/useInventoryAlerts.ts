'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, InventoryItem } from '@ferza/shared';

export const useInventoryAlerts = () => {
  return useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () =>
      fetchBFF<ApiResponse<InventoryItem[]>>('/bff/inventory/alerts'),
    refetchInterval: 60_000,
  });
};