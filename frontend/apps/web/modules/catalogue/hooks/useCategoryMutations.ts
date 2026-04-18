'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export type Category = {
  id: string;
  nameFr: string;
  nameAr: string;
  parentId: string | null;
  slug: string;
  createdAt: string;
};

export const useCategories = () =>
  useQuery({
    queryKey: ['catalogue', 'categories'],
    queryFn: () => fetchBFF<ApiResponse<Category[]>>('/bff/catalogue/categories'),
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { nameFr: string; nameAr?: string; parentId?: string | null; slug?: string }) =>
      fetchBFF<ApiResponse<Category>>('/bff/catalogue/categories', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; nameFr?: string; nameAr?: string; parentId?: string | null; slug?: string }) =>
      fetchBFF<ApiResponse<Category>>(`/bff/catalogue/categories/${id}`, {
        method: 'PATCH',
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchBFF<ApiResponse<{ id: string }>>(`/bff/catalogue/categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
  });
};
