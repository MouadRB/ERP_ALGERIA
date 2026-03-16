"use client";

import { useMutation } from "@tanstack/react-query";

export const useReindexOpenSearch = () => {
  return useMutation({
    mutationFn: async () => ({ status: "reindexed" })
  });
};
