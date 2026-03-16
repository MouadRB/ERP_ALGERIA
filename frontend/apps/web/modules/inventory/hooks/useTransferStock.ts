"use client";

import { useMutation } from "@tanstack/react-query";

export const useTransferStock = () => {
  return useMutation({
    mutationFn: async (payload: { sku: string; to: string }) => ({
      ...payload,
      status: "transferred"
    })
  });
};
