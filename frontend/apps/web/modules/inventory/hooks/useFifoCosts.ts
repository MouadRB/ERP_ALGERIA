'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, FifoLayer } from '@ferza/shared';

export const useFifoCosts = (sku: string) => {
  return useQuery({
    queryKey: ['inventory', 'fifo', sku],
    queryFn: () =>
      fetchBFF<ApiResponse<FifoLayer[]>>(`/bff/inventory/${sku}/fifo`),
    enabled: Boolean(sku),
  });
};