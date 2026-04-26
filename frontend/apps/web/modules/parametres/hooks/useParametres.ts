"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBFF } from "@/lib/fetchBFF";
import type { ApiResponse } from "@ferza/shared";
import type { ParametresFormData } from "../types";

export const useParametres = () => {
  return useQuery({
    queryKey: ["parametres"],
    queryFn: () => fetchBFF<ApiResponse<ParametresFormData>>("/bff/parametres")
  });
};
