"use client";

import { useMutation } from "@tanstack/react-query";

export const usePublishProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => ({ id, status: "published" })
  });
};
