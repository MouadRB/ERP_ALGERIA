'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';
import { invalidateCRMQueries } from './invalidateCRM';

export const useCreateCustomer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<Customer>) =>
      fetchBFF<ApiResponse<Customer>>('/bff/crm', {
        method: 'POST',
        body,
      }),
    onSuccess: () => invalidateCRMQueries(qc),
  });
};
