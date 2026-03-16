"use client";

import { useMutation } from "@tanstack/react-query";

export const useAssignCarrier = () => {
  return useMutation({
    mutationFn: async (payload: { orderId: string; carrier: string }) => ({
      ...payload,
      status: "assigned"
    })
  });
};
