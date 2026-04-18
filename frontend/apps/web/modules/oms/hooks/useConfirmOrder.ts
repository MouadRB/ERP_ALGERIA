'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { Order } from '@ferza/shared';
import { invalidateOMSQueries } from './invalidateOMS';

interface OrderResponse {
  data: Order;
}

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchBFF<OrderResponse>(`/bff/oms/${id}/confirm`, { method: 'PATCH' }),

    onSuccess: (_data, id) => {
      invalidateOMSQueries(queryClient, id);
      // SYNC-12: Confirmation changes reservation split (soft→hard) in Inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};
