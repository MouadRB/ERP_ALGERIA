"use client";

import { useQuery } from "@tanstack/react-query";

const mockQueue = [
  { id: "QUEUE-001", priority: "high", status: "waiting" }
];

export const useOMSQueue = () => {
  return useQuery({
    queryKey: ["oms", "queue"],
    queryFn: async () => mockQueue
  });
};
