"use client";

import { useMutation } from "@tanstack/react-query";

export const useReceiveBC = () => {
  return useMutation({
    mutationFn: async (id: string) => ({ id, status: "received" })
  });
};
