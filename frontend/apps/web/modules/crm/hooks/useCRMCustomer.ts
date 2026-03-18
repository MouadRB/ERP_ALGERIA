'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';

export const useCRMCustomer = (id: string) => {
  return useQuery({
    queryKey: ['crm', 'customer', id],
    queryFn: () =>
      fetchBFF<ApiResponse<Customer>>(`/bff/crm/${id}`),
    enabled: Boolean(id),
  });
};