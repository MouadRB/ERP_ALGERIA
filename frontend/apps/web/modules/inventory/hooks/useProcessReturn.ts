'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

type ProcessReturnPayload = {
  sku: string;
  returnId: string;
  decision: 'approve' | 'reject';
};

export const useProcessReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProcessReturnPayload) =>
      fetchBFF<ApiResponse<unknown>>('/bff/inventory/returns/decision', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // SYNC-12: Return processing affects OMS return status and Rapports
      queryClient.invalidateQueries({ queryKey: ['oms'] });
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
