'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

export const useRapportsCrossModule = (params: Record<string, unknown> = {}) =>
  useQuery({ queryKey: ['rapports', 'cross', params], queryFn: () => fetchBFF<ApiResponse<unknown>>('/bff/rapports', { params: { module: 'cross', ...params } }) });