'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';

export const useBlacklist = () => {
  return useQuery({
    queryKey: ['crm', 'blacklist'],
    queryFn: () =>
      fetchBFF<ApiResponse<Customer[]>>('/bff/crm', {
        params: { blacklisted: true },
      }),
  });
};