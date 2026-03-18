'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';

interface UpdateProductPayload {
  id: string;
  body: Partial<Product>;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateProductPayload) =>
      fetchBFF<ApiResponse<Product>>(`/bff/pim/${id}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pim', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['pim', 'product', id] });
    },
  });
};