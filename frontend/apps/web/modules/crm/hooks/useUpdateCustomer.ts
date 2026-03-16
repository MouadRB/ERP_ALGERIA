"use client";

import { useMutation } from "@tanstack/react-query";

export const useUpdateCustomer = () => {
  return useMutation({
    mutationFn: async (payload: { id: string; updates: Record<string, unknown> }) => ({
      ...payload,
      status: "updated"
    })
  });
};
