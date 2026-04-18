'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { Product } from '../components/pim.types';

export const usePIMProduct = (id: string) =>
  useQuery({
    queryKey: ['pim', 'product', id],
    queryFn: () => fetchBFF<ApiResponse<Product>>(`/bff/pim/${id}`),
    enabled: Boolean(id),
  });
