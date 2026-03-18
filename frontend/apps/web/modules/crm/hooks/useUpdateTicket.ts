'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface UpdateTicketPayload {
  id: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
}

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: UpdateTicketPayload) =>
      fetchBFF<ApiResponse<unknown>>(`/bff/crm/tickets/${id}`, {
        method: 'PATCH',
        body: { status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'tickets'] });
    },
  });
};