'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';
import { invalidatePIMQueries } from './invalidatePIM';

interface BulkSupplierPayload {
  ids: string[];
  supplierName: string;
}

export const useBulkChangeSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, supplierName }: BulkSupplierPayload) =>
      fetchBFF<ApiResponse<Product[]>>('/bff/pim/bulk/supplier', {
        method: 'PATCH',
        body: { ids, supplierName },
      }),
    onSuccess: () => {
      invalidatePIMQueries(queryClient);
      // SYNC-12: Supplier change affects Inventory enrichment (supplierName from PIM)
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
