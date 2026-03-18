'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Carrier, Order } from '@ferza/shared';

interface AssignCarrierPayload {
  id: string;
  carrier: Carrier;
}

export const useAssignCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, carrier }: AssignCarrierPayload) =>
      fetchBFF<ApiResponse<Order>>(`/bff/oms/${id}/assign-carrier`, {
        method: 'PATCH',
        body: { carrier },
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['oms', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['oms', 'order', id] });
    },
  });
};