"use client";

import { useMutation } from "@tanstack/react-query";

export const useCreateCustomer = () => {
  return useMutation({
    mutationFn: async (payload: { name: string }) => ({ id: "CUST-NEW", ...payload })
  });
};
