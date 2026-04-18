'use client';

import { useMutation } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface ExportPayload {
  ids?: string[];
  columns?: string[];
}

interface ExportResponse {
  csv: string;
  count: number;
}

const triggerCsvDownload = (csv: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pim-export-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const useExportProducts = () =>
  useMutation({
    mutationFn: ({ ids = [], columns = [] }: ExportPayload) =>
      fetchBFF<ApiResponse<ExportResponse>>('/bff/pim/bulk/export', {
        method: 'POST',
        body: { ids, columns },
      }),
    onSuccess: (response) => {
      if (response?.data?.csv) {
        triggerCsvDownload(response.data.csv);
      }
    },
  });
