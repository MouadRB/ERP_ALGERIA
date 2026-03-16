"use client";

import { useMutation } from "@tanstack/react-query";

export const useRemoveFromBlacklist = () => {
  return useMutation({
    mutationFn: async (id: string) => ({ id, status: "removed" })
  });
};
