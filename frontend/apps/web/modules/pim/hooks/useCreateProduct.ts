"use client";

import { useMutation } from "@tanstack/react-query";

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: async (payload: { name: string }) => ({ id: "PRD-NEW", ...payload })
  });
};
