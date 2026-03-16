"use client";

import { useQuery } from "@tanstack/react-query";

const mockCustomers = [{ id: "CUST-001", name: "Jane Doe", segment: "vip" }];

export const useCRMCustomer = (id: string) => {
  return useQuery({
    queryKey: ["crm", "customer", id],
    queryFn: async () => mockCustomers.find((c) => c.id === id) ?? null
  });
};
