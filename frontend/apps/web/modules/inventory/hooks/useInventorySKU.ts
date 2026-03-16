"use client";

import { useQuery } from "@tanstack/react-query";

const mockStock = [{ sku: "SKU-001", name: "Sample Item", quantity: 42 }];

export const useInventorySKU = (sku: string) => {
  return useQuery({
    queryKey: ["inventory", "sku", sku],
    queryFn: async () => mockStock.find((item) => item.sku === sku) ?? null
  });
};
