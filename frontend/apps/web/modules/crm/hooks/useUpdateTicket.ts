'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF }  from '@/lib/fetchBFF';
import type { ApiResponse, Ticket } from '@ferza/shared';
import { invalidateCRMQueries } from './invalidateCRM';

export interface UpdateTicketPayload {
  id:          string;
  customerId?: string;
  status?:     string;
  agentId?:    string;
  agentName?:  string;
  escalated?:  boolean;
  lastAction?: string;
  note?:       { content: string; author: string };
}

export const useUpdateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customerId: _cid, ...body }: UpdateTicketPayload) =>
      fetchBFF<ApiResponse<Ticket>>(`/bff/crm/tickets/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { customerId }) => invalidateCRMQueries(qc, customerId),
  });
};
