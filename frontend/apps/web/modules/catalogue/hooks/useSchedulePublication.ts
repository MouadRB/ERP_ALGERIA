"use client";

import { useMutation } from "@tanstack/react-query";

export const useSchedulePublication = () => {
  return useMutation({
    mutationFn: async (payload: { id: string; date: string }) => ({
      ...payload,
      status: "scheduled"
    })
  });
};
