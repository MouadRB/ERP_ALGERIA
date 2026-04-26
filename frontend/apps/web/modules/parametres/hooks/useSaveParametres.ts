"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBFF } from "@/lib/fetchBFF";
import type { ApiResponse } from "@ferza/shared";
import type { ParametresFormData } from "../types";

export const useSaveParametres = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ParametresFormData) =>
      fetchBFF<ApiResponse<ParametresFormData>>("/bff/parametres", {
        method: "PUT",
        body
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(["parametres"], response);
    }
  });
};
