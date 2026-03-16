"use client";

import { useQuery } from "@tanstack/react-query";

const mockMovements = [{ id: "MOV-001", type: "in", quantity: 10 }];

export const useStockMovements = () => {
  return useQuery({
    queryKey: ["inventory", "movements"],
    queryFn: async () => mockMovements
  });
};
