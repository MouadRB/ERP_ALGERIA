'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, BonCommande } from '@ferza/shared';

export const useCreateBC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<BonCommande>) =>
      fetchBFF<ApiResponse<BonCommande>>('/bff/procurement', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bcs'] });
    },
  });
};