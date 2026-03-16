"use client";

import { useQuery } from "@tanstack/react-query";

const mockCustomers = [{ id: "CUST-001", name: "Jane Doe", segment: "vip" }];

export const useCRMCustomers = () => {
  return useQuery({
    queryKey: ["crm", "customers"],
    queryFn: async () => mockCustomers
  });
};
