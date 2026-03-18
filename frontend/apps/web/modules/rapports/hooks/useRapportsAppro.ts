'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export const useRapportsAppro = (params: Record<string, unknown> = {}) =>
  useQuery({ queryKey: ['rapports', 'appro', params], queryFn: () => fetchBFF<ApiResponse<unknown>>('/bff/rapports', { params: { module: 'appro', ...params } }) });