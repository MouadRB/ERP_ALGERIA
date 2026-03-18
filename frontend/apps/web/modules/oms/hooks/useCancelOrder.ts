'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Order } from '@ferza/shared';

interface CancelPayload {
  id: string;
  reason: string;
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: CancelPayload) =>
      fetchBFF<ApiResponse<Order>>(`/bff/oms/${id}/cancel`, {
        method: 'PATCH',
        body: { reason },
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['oms', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['oms', 'order', id] });
    },
  });
};