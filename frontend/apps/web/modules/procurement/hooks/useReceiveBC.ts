'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, BonCommande } from '@ferza/shared';

interface ReceiveBCPayload {
  id: string;
  items: Array<{ sku: string; quantityReceived: number }>;
}

export const useReceiveBC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: ReceiveBCPayload) =>
      fetchBFF<ApiResponse<BonCommande>>(`/bff/procurement/${id}/receive`, {
        method: 'PATCH',
        body: { items },
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bcs'] });
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bc', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
