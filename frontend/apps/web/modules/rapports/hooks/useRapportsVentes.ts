"use client";

import { useQuery } from "@tanstack/react-query";

const mockSales = [{ id: "SALE-001", total: 120 }];

export const useRapportsVentes = () => {
  return useQuery({
    queryKey: ["rapports", "ventes"],
    queryFn: async () => mockSales
  });
};
