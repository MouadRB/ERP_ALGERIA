"use client";

import { useQuery } from "@tanstack/react-query";

const mockAnalytics = { ordersToday: 12, pending: 3 };

export const useOMSAnalytics = () => {
  return useQuery({
    queryKey: ["oms", "analytics"],
    queryFn: async () => mockAnalytics
  });
};
