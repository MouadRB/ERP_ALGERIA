'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface TransferPayload {
  sku: string;
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
}

export const useTransferStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferPayload) =>
      fetchBFF<ApiResponse<unknown>>('/bff/inventory/transfer', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
};