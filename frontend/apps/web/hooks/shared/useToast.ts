"use client";

import { useState } from "react";

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
};

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info"
  });

  const showToast = (message: string, severity: ToastState["severity"] = "info") => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  return { toast, showToast, closeToast };
};
