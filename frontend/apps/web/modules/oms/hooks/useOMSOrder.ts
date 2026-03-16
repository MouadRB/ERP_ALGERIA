"use client";

import { useQuery } from "@tanstack/react-query";

const mockOrders = [
  { id: "ORD-001", customer: "John Doe", status: "pending", total: 120 }
];

export const useOMSOrder = (id: string) => {
  return useQuery({
    queryKey: ["oms", "order", id],
    queryFn: async () => mockOrders.find((order) => order.id === id) ?? null
  });
};
