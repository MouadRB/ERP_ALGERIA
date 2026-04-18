'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';
import { invalidatePIMQueries } from './invalidatePIM';

interface BulkStatusPayload {
  ids: string[];
  status: string;
}

export const useBulkChangeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: BulkStatusPayload) =>
      fetchBFF<ApiResponse<Product[]>>('/bff/pim/bulk/status', {
        method: 'PATCH',
        body: { ids, status },
      }),
    onSuccess: () => {
      invalidatePIMQueries(queryClient);
      // SYNC-12: Status change affects Catalogue enrichment
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};
