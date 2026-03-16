"use client";

import { useMutation } from "@tanstack/react-query";

export const useRejectBC = () => {
  return useMutation({
    mutationFn: async (payload: { id: string; reason: string }) => ({
      ...payload,
      status: "rejected"
    })
  });
};
