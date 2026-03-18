'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface OpenSearchStatus {
  totalIndexed: number;
  totalPublished: number;
  lastIndexedAt: string | null;
  health: 'green' | 'yellow' | 'red';
}

export const useOpenSearchStatus = () => {
  return useQuery({
    queryKey: ['catalogue', 'opensearch-status'],
    queryFn: () =>
      fetchBFF<ApiResponse<OpenSearchStatus>>('/bff/catalogue/opensearch/status'),
    refetchInterval: 60_000,
  });
};