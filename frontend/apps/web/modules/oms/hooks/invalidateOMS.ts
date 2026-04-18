import type { QueryClient } from '@tanstack/react-query';

const OMS_INVALIDATE_KEYS: Array<readonly unknown[]> = [
  ['oms', 'stats'],
  ['oms', 'orders'],
  ['oms', 'queue'],
  ['oms', 'suivi'],
  ['oms', 'analytics'],
  ['oms', 'retours'],
  ['dashboard'],
];

export const invalidateOMSQueries = (queryClient: QueryClient, orderId?: string) => {
  OMS_INVALIDATE_KEYS.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
  if (orderId) {
    queryClient.invalidateQueries({ queryKey: ['oms', 'order', orderId] });
  }
};
