"use client";

import { useMutation } from "@tanstack/react-query";

export const useUnpublishProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => ({ id, status: "unpublished" })
  });
};
