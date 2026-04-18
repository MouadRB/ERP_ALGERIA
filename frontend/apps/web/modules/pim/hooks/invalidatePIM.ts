import type { QueryClient } from '@tanstack/react-query';

const PIM_INVALIDATE_KEYS: Array<readonly unknown[]> = [
  ['pim', 'products'],
  ['pim', 'stats'],
];

export const invalidatePIMQueries = (queryClient: QueryClient, productId?: string) => {
  PIM_INVALIDATE_KEYS.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
  if (productId) {
    queryClient.invalidateQueries({ queryKey: ['pim', 'product', productId] });
  }
};
