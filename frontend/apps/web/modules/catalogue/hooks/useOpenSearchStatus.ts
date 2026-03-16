"use client";

import { useQuery } from "@tanstack/react-query";

const mockStatus = { status: "green", lastSync: "just now" };

export const useOpenSearchStatus = () => {
  return useQuery({
    queryKey: ["catalogue", "opensearch-status"],
    queryFn: async () => mockStatus
  });
};
