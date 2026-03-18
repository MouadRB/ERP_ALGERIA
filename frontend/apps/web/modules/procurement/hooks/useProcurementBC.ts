'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, BonCommande } from '@ferza/shared';

export const useProcurementBC = (id: string) => {
  return useQuery({
    queryKey: ['procurement', 'bc', id],
    queryFn: () =>
      fetchBFF<ApiResponse<BonCommande>>(`/bff/procurement/${id}`),
    enabled: Boolean(id),
  });
};