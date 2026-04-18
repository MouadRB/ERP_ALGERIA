'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { Order } from '@ferza/shared';
import { invalidateOMSQueries } from './invalidateOMS';

interface OrderResponse {
  data: Order;
}

interface AssignPayload {
  id:      string;
  carrier: 'Yalidine' | 'Maystro' | 'Ecotrack' | 'Procolis';
}

export const useAssignCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, carrier }: AssignPayload) =>
      fetchBFF<OrderResponse>(`/bff/oms/${id}/assign-carrier`, {
        method: 'PATCH',
        body:   { carrier },
      }),

    onSuccess: (_data, { id }) => {
      invalidateOMSQueries(queryClient, id);
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
