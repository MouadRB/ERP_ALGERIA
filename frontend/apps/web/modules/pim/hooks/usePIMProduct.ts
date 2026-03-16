"use client";

import { useQuery } from "@tanstack/react-query";

const mockProducts = [
  { id: "PRD-001", name: "Sample Product", status: "active", price: 99 }
];

export const usePIMProduct = (id: string) => {
  return useQuery({
    queryKey: ["pim", "product", id],
    queryFn: async () => mockProducts.find((product) => product.id === id) ?? null
  });
};
