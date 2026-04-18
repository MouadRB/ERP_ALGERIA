'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { InventoryItem } from '../inventory.types';

export const useInventoryAlerts = () =>
  useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () => fetchBFF<ApiResponse<InventoryItem[]>>('/bff/inventory/alerts'),
    refetchInterval: 60_000,
  });
