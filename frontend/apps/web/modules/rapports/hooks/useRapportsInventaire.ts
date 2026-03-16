"use client";

import { useQuery } from "@tanstack/react-query";

const mockInventory = [{ sku: "SKU-001", quantity: 42 }];

export const useRapportsInventaire = () => {
  return useQuery({
    queryKey: ["rapports", "inventaire"],
    queryFn: async () => mockInventory
  });
};
