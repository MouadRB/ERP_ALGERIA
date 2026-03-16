"use client";

import { useQuery } from "@tanstack/react-query";

const mockClients = [{ id: "CUST-001", segment: "vip" }];

export const useRapportsClients = () => {
  return useQuery({
    queryKey: ["rapports", "clients"],
    queryFn: async () => mockClients
  });
};
