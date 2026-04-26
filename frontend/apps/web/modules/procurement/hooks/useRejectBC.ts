'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, BonCommande } from '@ferza/shared';

interface RejectBCPayload {
  id: string;
  reason: string;
}

export const useRejectBC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: RejectBCPayload) =>
      fetchBFF<ApiResponse<BonCommande>>(`/bff/procurement/${id}/reject`, {
        method: 'PATCH',
        body: { reason },
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bcs'] });
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bc', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
