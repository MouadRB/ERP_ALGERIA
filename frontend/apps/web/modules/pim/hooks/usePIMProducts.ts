"use client";

import { useQuery } from "@tanstack/react-query";

const mockProducts = [
  { id: "PRD-001", name: "Sample Product", status: "active", price: 99 }
];

export const usePIMProducts = () => {
  return useQuery({
    queryKey: ["pim", "products"],
    queryFn: async () => mockProducts
  });
};
