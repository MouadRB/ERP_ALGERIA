"use client";

import { useQuery } from "@tanstack/react-query";

const mockCatalogue = [{ id: "CAT-001", title: "Main Catalogue", status: "active" }];

export const useCatalogue = () => {
  return useQuery({
    queryKey: ["catalogue", "list"],
    queryFn: async () => mockCatalogue
  });
};
