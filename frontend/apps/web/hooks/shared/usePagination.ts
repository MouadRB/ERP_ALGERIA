'use client';

import { useState } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
}

interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

export const usePagination = (
  initialPage = 1,
  initialPageSize = 20,
): UsePaginationReturn => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    reset: () => {
      setPage(1);
      setPageSize(initialPageSize);
    },
  };
};