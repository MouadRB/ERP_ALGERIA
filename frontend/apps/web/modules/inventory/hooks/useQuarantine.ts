"use client";

import { useMutation } from "@tanstack/react-query";

export const useQuarantine = () => {
  return useMutation({
    mutationFn: async (payload: { sku: string }) => ({
      ...payload,
      status: "quarantined"
    })
  });
};
