"use client";

import { useQuery } from "@tanstack/react-query";

const mockBCs = [{ id: "BC-001", supplier: "Supplier A", status: "draft" }];

export const useProcurementBCs = () => {
  return useQuery({
    queryKey: ["procurement", "bcs"],
    queryFn: async () => mockBCs
  });
};
