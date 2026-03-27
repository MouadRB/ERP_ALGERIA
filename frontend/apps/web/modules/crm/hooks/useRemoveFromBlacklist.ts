'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF }  from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';
import { invalidateCRMQueries } from './invalidateCRM';

export const useRemoveFromBlacklist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchBFF<ApiResponse<Customer>>(`/bff/crm/${id}/blacklist`, { method: 'DELETE' }),
    onSuccess: (_data, id) => invalidateCRMQueries(qc, id),
  });
};
