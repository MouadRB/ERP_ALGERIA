'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<Customer>) =>
      fetchBFF<ApiResponse<Customer>>('/bff/crm', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'customers'] });
    },
  });
};