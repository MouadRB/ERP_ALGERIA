'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, BonCommande } from '@ferza/shared';

export const useApproveBC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchBFF<ApiResponse<BonCommande>>(`/bff/procurement/${id}/approve`, {
        method: 'PATCH',
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bcs'] });
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bc', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
