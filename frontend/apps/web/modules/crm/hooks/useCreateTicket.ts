'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface CreateTicketPayload {
  customerId: string;
  subject: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
}

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) =>
      fetchBFF<ApiResponse<unknown>>('/bff/crm/tickets', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'tickets'] });
    },
  });
};