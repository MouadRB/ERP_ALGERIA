'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { Order } from '@ferza/shared';
import { invalidateOMSQueries } from './invalidateOMS';

interface OrderResponse {
  data: Order;
}

export const useDeliverOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchBFF<OrderResponse>(`/bff/oms/${id}/deliver`, { method: 'PATCH' }),

    onSuccess: (_data, id) => {
      invalidateOMSQueries(queryClient, id);
      // SYNC-12: Delivery deducts stock from Inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // SYNC-12: Delivery affects revenue metrics in Rapports
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
