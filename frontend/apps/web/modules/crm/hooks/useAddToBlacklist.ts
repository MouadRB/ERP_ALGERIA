'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF }  from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';
import { invalidateCRMQueries } from './invalidateCRM';

interface BlacklistPayload {
  id:     string;
  motif:  string;
  reason?: string;
}

export const useAddToBlacklist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif, reason }: BlacklistPayload) =>
      fetchBFF<ApiResponse<Customer>>(`/bff/crm/${id}/blacklist`, {
        method: 'PATCH',
        body: { motif, reason },
      }),
    onSuccess: (_data, { id }) => invalidateCRMQueries(qc, id),
  });
};
