"use client";

import { useMutation } from "@tanstack/react-query";

export const useAdjustStock = () => {
  return useMutation({
    mutationFn: async (payload: { sku: string; delta: number }) => ({
      ...payload,
      status: "adjusted"
    })
  });
};
