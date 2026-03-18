'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export const useCatalogueItem = (id: string) => {
  return useQuery({
    queryKey: ['catalogue', 'item', id],
    queryFn: () =>
      fetchBFF<ApiResponse<unknown>>(`/bff/catalogue/${id}`),
    enabled: Boolean(id),
  });
};