'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';
import type { OpenSearchStatus } from '../catalogue.types';

export const useOpenSearchStatus = () =>
  useQuery({
    queryKey: ['catalogue', 'opensearch-status'],
    queryFn: () =>
      fetchBFF<ApiResponse<OpenSearchStatus>>('/bff/catalogue/opensearch/status'),
    refetchInterval: 60_000,
  });
