'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';
import { invalidatePIMQueries } from './invalidatePIM';

interface BulkTvaPayload {
  ids: string[];
  tvaRate: 'standard' | 'reduced' | 'exempt';
}

export const useBulkChangeTVA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, tvaRate }: BulkTvaPayload) =>
      fetchBFF<ApiResponse<Product[]>>('/bff/pim/bulk/tva', {
        method: 'PATCH',
        body: { ids, tvaRate },
      }),
    onSuccess: () => {
      invalidatePIMQueries(queryClient);
      // SYNC-12: TVA change affects prices in Catalogue & Inventory
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
