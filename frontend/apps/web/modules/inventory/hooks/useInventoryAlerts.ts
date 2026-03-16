"use client";

import { useQuery } from "@tanstack/react-query";

const mockAlerts = [{ id: "AL-001", message: "Low stock" }];

export const useInventoryAlerts = () => {
  return useQuery({
    queryKey: ["inventory", "alerts"],
    queryFn: async () => mockAlerts
  });
};
