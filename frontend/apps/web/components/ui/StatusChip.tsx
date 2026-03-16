"use client";

import { Chip } from "@mui/material";

type StatusChipProps = {
  label: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error";
};

export default function StatusChip({ label, color = "default" }: StatusChipProps) {
  return <Chip label={label} color={color} size="small" />;
}
