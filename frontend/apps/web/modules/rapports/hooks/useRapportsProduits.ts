"use client";

import { useQuery } from "@tanstack/react-query";

const mockProducts = [{ id: "PRD-001", name: "Sample Product" }];

export const useRapportsProduits = () => {
  return useQuery({
    queryKey: ["rapports", "produits"],
    queryFn: async () => mockProducts
  });
};
