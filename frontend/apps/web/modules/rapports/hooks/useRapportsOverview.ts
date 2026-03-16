"use client";

import { useQuery } from "@tanstack/react-query";

const mockOverview = { revenue: 1000, orders: 12 };

export const useRapportsOverview = () => {
  return useQuery({
    queryKey: ["rapports", "overview"],
    queryFn: async () => mockOverview
  });
};
