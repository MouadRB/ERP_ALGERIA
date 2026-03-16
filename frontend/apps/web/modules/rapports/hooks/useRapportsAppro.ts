"use client";

import { useQuery } from "@tanstack/react-query";

const mockAppro = [{ id: "BC-001", status: "draft" }];

export const useRapportsAppro = () => {
  return useQuery({
    queryKey: ["rapports", "appro"],
    queryFn: async () => mockAppro
  });
};
