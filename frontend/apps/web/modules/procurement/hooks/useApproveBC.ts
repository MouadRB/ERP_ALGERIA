"use client";

import { useMutation } from "@tanstack/react-query";

export const useApproveBC = () => {
  return useMutation({
    mutationFn: async (id: string) => ({ id, status: "approved" })
  });
};
