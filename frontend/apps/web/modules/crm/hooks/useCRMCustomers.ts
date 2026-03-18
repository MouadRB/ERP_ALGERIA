'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';

interface UseCRMCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  segment?: string;
}

export const useCRMCustomers = (params: UseCRMCustomersParams = {}) => {
  return useQuery({
    queryKey: ['crm', 'customers', params],
    queryFn: () =>
      fetchBFF<ApiResponse<Customer[]>>('/bff/crm', { params }),
  });
};