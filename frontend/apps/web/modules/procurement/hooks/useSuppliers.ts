"use client";

import { useQuery } from "@tanstack/react-query";

const mockSuppliers = [{ id: "SUP-001", name: "Supplier A" }];

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["procurement", "suppliers"],
    queryFn: async () => mockSuppliers
  });
};
