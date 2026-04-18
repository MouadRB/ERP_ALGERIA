'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse, Product } from '@ferza/shared';

type CreateProductPayload = Partial<Product> & Record<string, unknown>;

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductPayload) =>
      fetchBFF<ApiResponse<Product>>('/bff/pim', {
        method: 'POST',
        body,
      }),
    onSuccess: (response) => {
      const created = response.data;

      queryClient.setQueriesData<ApiResponse<Product[]>>(
        { queryKey: ['pim', 'products'] },
        (current) => {
          if (!current?.data) return current;

          if (current.data.some((item) => item.id === created.id)) {
            return current;
          }

          const nextRows = [created, ...current.data];
          return {
            ...current,
            data: nextRows,
            meta: {
              ...current.meta,
              total: (current.meta?.total ?? current.data.length) + 1,
            },
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ['pim', 'products'] });
      // SYNC-12: New PIM product may appear in Catalogue enrichment
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};
