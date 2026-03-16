"use client";

import { useMutation } from "@tanstack/react-query";

export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: async (id: string) => ({ id, status: "deleted" })
  });
};
