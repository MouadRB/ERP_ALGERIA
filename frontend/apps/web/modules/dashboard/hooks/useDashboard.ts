'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@ferza/shared';
import { fetchBFF } from '@/lib/fetchBFF';
import { transformDashboard } from '../transformer';
import type { DashboardVM, RawDashboardDTO } from '../types';

const POLL_INTERVAL_MS = 30_000;

export const useDashboard = () =>
  useQuery<ApiResponse<RawDashboardDTO>, Error, DashboardVM>({
    queryKey: ['dashboard'],
    queryFn: () => fetchBFF<ApiResponse<RawDashboardDTO>>('/bff/dashboard'),
    select: (res) => transformDashboard(res.data),
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
