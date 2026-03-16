"use client";

import { useMutation } from "@tanstack/react-query";

export const useCreateTicket = () => {
  return useMutation({
    mutationFn: async (payload: { subject: string }) => ({ id: "TCK-NEW", ...payload })
  });
};
