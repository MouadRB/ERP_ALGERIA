"use client";

import { useQuery } from "@tanstack/react-query";

const mockStock = [{ sku: "SKU-001", name: "Sample Item", quantity: 42 }];

export const useInventoryStock = () => {
  return useQuery({
    queryKey: ["inventory", "stock"],
    queryFn: async () => mockStock
  });
};
