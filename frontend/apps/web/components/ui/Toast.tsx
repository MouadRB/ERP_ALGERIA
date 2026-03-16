"use client";

import { Alert, Snackbar } from "@mui/material";

type ToastProps = {
  open: boolean;
  message: string;
  severity?: "success" | "info" | "warning" | "error";
  onClose: () => void;
};

export default function Toast({
  open,
  message,
  severity = "info",
  onClose
}: ToastProps) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
      <Alert severity={severity} onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
