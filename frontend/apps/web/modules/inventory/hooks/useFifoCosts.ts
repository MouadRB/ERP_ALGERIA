"use client";

import { useQuery } from "@tanstack/react-query";

const mockFifo = [{ layer: "L1", cost: 12 }];

export const useFifoCosts = () => {
  return useQuery({
    queryKey: ["inventory", "fifo"],
    queryFn: async () => mockFifo
  });
};
