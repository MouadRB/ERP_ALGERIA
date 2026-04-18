'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { InventoryStats } from '../inventory.types';

export const useInventoryStats = () =>
  useQuery({
    queryKey: ['inventory', 'stats'],
    queryFn: () => fetchBFF<ApiResponse<InventoryStats>>('/bff/inventory/stats'),
  });
