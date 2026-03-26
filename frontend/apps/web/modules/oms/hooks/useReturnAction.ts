'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import { invalidateOMSQueries } from './invalidateOMS';

type ReturnAction = 'reintegrate' | 'resend' | 'declare_loss';

interface ReturnActionPayload {
  id: string;
  action: ReturnAction;
  items?: Array<{ sku: string; quantity?: number; qty?: number }>;
}

export const useReturnAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, items }: ReturnActionPayload) =>
      fetchBFF(`/bff/oms/${id}/return-action`, {
        method: 'PATCH',
        body: { action, items },
      }),
    onSuccess: (_data, variables) => {
      invalidateOMSQueries(queryClient, variables.id);
    },
  });
};
