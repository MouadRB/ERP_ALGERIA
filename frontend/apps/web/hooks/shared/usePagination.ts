"use client";

import { useState } from "react";

export const usePagination = (initialPage = 0, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return { page, setPage, pageSize, setPageSize };
};
