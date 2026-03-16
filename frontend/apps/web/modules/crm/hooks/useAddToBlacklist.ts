"use client";

import { useMutation } from "@tanstack/react-query";

export const useAddToBlacklist = () => {
  return useMutation({
    mutationFn: async (payload: { id: string; reason: string }) => ({
      ...payload,
      status: "blacklisted"
    })
  });
};
