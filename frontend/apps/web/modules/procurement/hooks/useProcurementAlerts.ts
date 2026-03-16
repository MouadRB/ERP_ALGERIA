"use client";

import { useQuery } from "@tanstack/react-query";

const mockAlerts = [{ id: "AL-001", message: "Supplier delay" }];

export const useProcurementAlerts = () => {
  return useQuery({
    queryKey: ["procurement", "alerts"],
    queryFn: async () => mockAlerts
  });
};
