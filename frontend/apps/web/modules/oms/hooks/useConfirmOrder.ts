"use client";

import { useMutation } from "@tanstack/react-query";

export const useConfirmOrder = () => {
  return useMutation({
    mutationFn: async (id: string) => ({ id, status: "confirmed" })
  });
};
