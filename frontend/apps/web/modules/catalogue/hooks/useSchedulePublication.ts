'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface SchedulePayload {
  id: string;
  scheduledAt: string; // ISO 8601
}

export const useSchedulePublication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledAt }: SchedulePayload) =>
      fetchBFF<ApiResponse<unknown>>(`/bff/catalogue/${id}/schedule`, {
        method: 'PATCH',
        body: { scheduledAt },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};