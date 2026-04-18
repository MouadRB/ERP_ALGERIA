'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import { invalidatePIMQueries } from './invalidatePIM';

interface PlanReapproPayload {
  ids: string[];
  date?: string;
  qty?: number;
}

export const usePlanReappro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, date, qty }: PlanReapproPayload) =>
      fetchBFF<ApiResponse<unknown>>('/bff/pim/bulk/plan-reappro', {
        method: 'POST',
        body: { ids, date, qty },
      }),
    onSuccess: () => {
      invalidatePIMQueries(queryClient);
    },
  });
};
