'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';

interface BlacklistPayload {
  id: string;
  reason: string;
}

export const useAddToBlacklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: BlacklistPayload) =>
      fetchBFF<ApiResponse<Customer>>(`/bff/crm/${id}/blacklist`, {
        method: 'PATCH',
        body: { reason },
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'customer', id] });
    },
  });
};