'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface QuarantinePayload {
  sku: string;
  quantity: number;
  reason: string;
}

export const useQuarantine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuarantinePayload) =>
      fetchBFF<ApiResponse<unknown>>('/bff/inventory/quarantine', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // SYNC-12: Quarantine affects available stock in Rapports
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
