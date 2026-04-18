'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import { invalidateOMSQueries } from './invalidateOMS';

export interface CreateOrderPayload {
  nomComplet: string;
  telephone: string;
  adresse: string;
  wilayaCode: string;
  commune: string;
  source?: string;
  noteInterne?: string;
  items?: Array<{ sku: string; quantity?: number; qty?: number }>;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      fetchBFF('/bff/oms', { method: 'POST', body: payload }),
    onSuccess: () => {
      invalidateOMSQueries(queryClient);
      // SYNC-12: New order creates soft reservation in Inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // SYNC-12: New order updates customer order count in CRM
      queryClient.invalidateQueries({ queryKey: ['crm'] });
    },
  });
};
