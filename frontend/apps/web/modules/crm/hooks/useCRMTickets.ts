'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Ticket } from '@ferza/shared';

export interface UseCRMTicketsParams {
  customerId?: string;
  status?:     string;
  category?:   string;
  priority?:   string;
  page?:       number;
  pageSize?:   number;
}

export const useCRMTickets = (params: UseCRMTicketsParams = {}) =>
  useQuery({
    queryKey: ['crm', 'tickets', params],
    queryFn:  () => fetchBFF<ApiResponse<Ticket[]>>('/bff/crm/tickets', { params }),
  });
