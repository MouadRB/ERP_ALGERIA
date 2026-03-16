"use client";

import { useQuery } from "@tanstack/react-query";

const mockCatalogue = [{ id: "CAT-001", title: "Main Catalogue", status: "active" }];

export const useCatalogueItem = (id: string) => {
  return useQuery({
    queryKey: ["catalogue", "item", id],
    queryFn: async () => mockCatalogue.find((item) => item.id === id) ?? null
  });
};
