'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { InventoryItem } from '../inventory.types';

export type InventoryMovementType =
  | 'receipt'
  | 'sale'
  | 'return'
  | 'quarantine'
  | 'physicalInventory';

export interface CreateMovementPayload {
  sku: string;
  type: InventoryMovementType;
  quantity: number;
  reason?: string;
  unitCostHT?: number;
  referenceId?: string;
}

export const useCreateMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMovementPayload) =>
      fetchBFF<ApiResponse<InventoryItem>>('/bff/inventory/movements', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // SYNC-12: Stock movements affect Rapports inventory metrics
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
};
