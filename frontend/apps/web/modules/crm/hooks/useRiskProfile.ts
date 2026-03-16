"use client";

import { useQuery } from "@tanstack/react-query";

const mockRisk = { level: "low" };

export const useRiskProfile = () => {
  return useQuery({
    queryKey: ["crm", "risk-profile"],
    queryFn: async () => mockRisk
  });
};
