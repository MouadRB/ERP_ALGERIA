"use client";

import { useState } from "react";

export const useFilters = <T extends Record<string, unknown>>(initial: T) => {
  const [filters, setFilters] = useState<T>(initial);

  const updateFilter = (key: keyof T, value: T[keyof T]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return { filters, updateFilter, setFilters };
};
