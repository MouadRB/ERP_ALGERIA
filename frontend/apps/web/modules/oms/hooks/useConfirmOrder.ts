'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Order } from '@ferza/shared';

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchBFF<ApiResponse<Order>>(`/bff/oms/${id}/confirm`, {
        method: 'PATCH',
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['oms', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['oms', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['oms', 'queue'] });
    },
  });
};