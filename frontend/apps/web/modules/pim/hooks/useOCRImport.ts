"use client";

import { useMutation } from "@tanstack/react-query";

export const useOCRImport = () => {
  return useMutation({
    mutationFn: async (payload: { fileName: string }) => ({
      ...payload,
      status: "imported"
    })
  });
};
