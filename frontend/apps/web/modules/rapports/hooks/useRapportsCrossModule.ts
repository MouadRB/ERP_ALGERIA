"use client";

import { useQuery } from "@tanstack/react-query";

const mockCross = [{ id: "X-001", status: "ok" }];

export const useRapportsCrossModule = () => {
  return useQuery({
    queryKey: ["rapports", "cross-module"],
    queryFn: async () => mockCross
  });
};
