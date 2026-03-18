'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, BonCommande } from '@ferza/shared';

interface UseProcurementBCsParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export const useProcurementBCs = (params: UseProcurementBCsParams = {}) => {
  return useQuery({
    queryKey: ['procurement', 'bcs', params],
    queryFn: () =>
      fetchBFF<ApiResponse<BonCommande[]>>('/bff/procurement', { params }),
  });
};