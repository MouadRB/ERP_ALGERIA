'use client';

import { useMutation } from '@tanstack/react-query';
import { fetchBFF }    from '@/lib/fetchBFF';
import type { ApiResponse, Customer } from '@ferza/shared';

export const usePhoneLookup = () =>
  useMutation({
    mutationFn: (phone: string) =>
      fetchBFF<ApiResponse<Customer | null>>('/bff/crm/lookup', {
        params: { phone },
      }),
  });
