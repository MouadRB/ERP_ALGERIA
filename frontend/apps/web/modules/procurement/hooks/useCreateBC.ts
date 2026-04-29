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
    onSuccess: (response) => {
      const newBC = response.data;
      queryClient.setQueriesData(
        { queryKey: ['procurement', 'bcs'] },
        (current) => {
          if (!current) return current;
          const typed = current as ApiResponse<BonCommande[]>;
          const existing = typed.data ?? [];
          const has = existing.some((item) => item.id === newBC.id);
          const data = has ? existing : [newBC, ...existing];
          return {
            ...typed,
            data,
            meta: {
              ...typed.meta,
              total: (typed.meta?.total ?? existing.length) + (has ? 0 : 1),
            },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['procurement', 'bcs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
