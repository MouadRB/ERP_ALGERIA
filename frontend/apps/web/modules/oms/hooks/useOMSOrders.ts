"use client";

import { useQuery } from "@tanstack/react-query";

const mockOrders = [
  { id: "ORD-001", customer: "John Doe", status: "pending", total: 120 }
];

export const useOMSOrders = () => {
  return useQuery({
    queryKey: ["oms", "orders"],
    queryFn: async () => mockOrders
  });
};
