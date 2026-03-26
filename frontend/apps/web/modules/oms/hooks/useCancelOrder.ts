'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { Order } from '@ferza/shared';
import { invalidateOMSQueries } from './invalidateOMS';

interface OrderResponse {
  data: Order;
}

interface CancelPayload {
  id:     string;
  reason: string;
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: CancelPayload) =>
      fetchBFF<OrderResponse>(`/bff/oms/${id}/cancel`, {
        method: 'PATCH',
        body:   { reason },
      }),

    onSuccess: (_data, { id }) => {
      invalidateOMSQueries(queryClient, id);
    },
  });
};
