"use client";

import { useQuery } from "@tanstack/react-query";

const mockMargins = [{ id: "M-001", margin: 0.2 }];

export const useRapportsMargins = () => {
  return useQuery({
    queryKey: ["rapports", "margins"],
    queryFn: async () => mockMargins
  });
};
