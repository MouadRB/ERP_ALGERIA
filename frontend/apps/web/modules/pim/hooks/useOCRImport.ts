'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';

export const useOCRImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { imageUrl: string }) =>
      fetchBFF<ApiResponse<Partial<Product>>>('/bff/pim/ocr-import', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pim', 'products'] });
    },
  });
};