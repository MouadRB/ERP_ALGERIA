"use client";

import { useMutation } from "@tanstack/react-query";

export const useCreateBC = () => {
  return useMutation({
    mutationFn: async (payload: { supplier: string }) => ({ id: "BC-NEW", ...payload })
  });
};
