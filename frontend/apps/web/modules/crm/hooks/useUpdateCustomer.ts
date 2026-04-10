'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF }  from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';
import { invalidateCRMQueries } from './invalidateCRM';

interface UpdateCustomerPayload {
  id:   string;
  body: Partial<Customer>;
}

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: UpdateCustomerPayload) =>
      fetchBFF<ApiResponse<Customer>>(`/bff/crm/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { id }) => invalidateCRMQueries(qc, id),
  });
};
