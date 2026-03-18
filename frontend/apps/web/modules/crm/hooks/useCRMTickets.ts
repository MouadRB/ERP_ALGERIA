'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export const useCRMTickets = (customerId?: string) => {
  return useQuery({
    queryKey: ['crm', 'tickets', customerId],
    queryFn: () =>
      fetchBFF<ApiResponse<Ticket[]>>('/bff/crm/tickets', {
        params: customerId ? { customerId } : {},
      }),
  });
};