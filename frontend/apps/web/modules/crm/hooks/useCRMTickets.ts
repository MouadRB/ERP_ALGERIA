"use client";

import { useQuery } from "@tanstack/react-query";

const mockTickets = [{ id: "TCK-001", subject: "Support request", status: "open" }];

export const useCRMTickets = () => {
  return useQuery({
    queryKey: ["crm", "tickets"],
    queryFn: async () => mockTickets
  });
};
