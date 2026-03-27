'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF }  from '@/lib/fetchBFF';
import type { ApiResponse, Ticket } from '@ferza/shared';
import { invalidateCRMQueries } from './invalidateCRM';

export interface CreateTicketPayload {
  customerId:         string;
  customerPhone?:     string;
  customerNameFr?:    string;
  customerWilayaCode?: string;
  orderId?:           string | null;
  category:           string;
  priority?:          'Faible' | 'Normale' | 'Haute' | 'Critique';
  subject?:           string;
  description?:       string;
}

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) =>
      fetchBFF<ApiResponse<Ticket>>('/bff/crm/tickets', { method: 'POST', body: payload }),
    onSuccess: (_data, { customerId }) => invalidateCRMQueries(qc, customerId),
  });
};
