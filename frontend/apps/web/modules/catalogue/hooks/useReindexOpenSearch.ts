'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export const useReindexOpenSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      fetchBFF<ApiResponse<unknown>>('/bff/catalogue/opensearch/reindex', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue', 'opensearch-status'] });
    },
  });
};