"use client";

import { useQuery } from "@tanstack/react-query";

const mockBlacklist = [{ id: "CUST-999", reason: "fraud" }];

export const useBlacklist = () => {
  return useQuery({
    queryKey: ["crm", "blacklist"],
    queryFn: async () => mockBlacklist
  });
};
