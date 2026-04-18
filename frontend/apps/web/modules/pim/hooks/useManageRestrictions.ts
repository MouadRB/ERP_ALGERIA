'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';
import { invalidatePIMQueries } from './invalidatePIM';

interface ManageRestrictionsArgs {
  productId: string;
  wilayasRestreintes: string[];
}

export const useManageRestrictions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, wilayasRestreintes }: ManageRestrictionsArgs) =>
      fetchBFF<ApiResponse<Product>>(`/bff/pim/${productId}/restrictions`, {
        method: 'PATCH',
        body: { wilayasRestreintes },
      }),
    onSuccess: (_data, { productId }) => {
      invalidatePIMQueries(queryClient, productId);
      // SYNC-12: Wilaya restrictions affect Catalogue publication rules
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};
