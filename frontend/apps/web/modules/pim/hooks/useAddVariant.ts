'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';
import { invalidatePIMQueries } from './invalidatePIM';

interface VariantPayload {
  sku?: string;
  barcode?: string | null;
  attributes?: Record<string, string>;
  priceTTC?: number;
  costFifo?: number;
  stock: number;
  seuil?: number;
}

interface AddVariantArgs {
  productId: string;
  variant: VariantPayload;
}

export const useAddVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variant }: AddVariantArgs) =>
      fetchBFF<ApiResponse<Product>>(`/bff/pim/${productId}/variants`, {
        method: 'POST',
        body: variant,
      }),
    onSuccess: (_data, { productId }) => {
      invalidatePIMQueries(queryClient, productId);
      // SYNC-12: New variant affects Catalogue & Inventory enrichment
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
