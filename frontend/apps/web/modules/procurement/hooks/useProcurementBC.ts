"use client";

import { useQuery } from "@tanstack/react-query";

const mockBCs = [{ id: "BC-001", supplier: "Supplier A", status: "draft" }];

export const useProcurementBC = (id: string) => {
  return useQuery({
    queryKey: ["procurement", "bc", id],
    queryFn: async () => mockBCs.find((bc) => bc.id === id) ?? null
  });
};
