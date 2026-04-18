'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface ToggleChannelPayload {
  channelId: string;
  enabled: boolean;
  id: string;
}

export const useToggleChannelStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, channelId, enabled }: ToggleChannelPayload) =>
      fetchBFF<ApiResponse<unknown>>(`/bff/catalogue/${id}/channels/${channelId}`, {
        method: 'PATCH',
        body: { enabled },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};
