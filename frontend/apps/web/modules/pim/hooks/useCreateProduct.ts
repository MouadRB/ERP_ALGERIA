'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<Product>) =>
      fetchBFF<ApiResponse<Product>>('/bff/pim', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pim', 'products'] });
    },
  });
};