"use client";

import { Chip } from "@mui/material";

type RiskBadgeProps = {
  level: "low" | "medium" | "high";
};

export default function RiskBadge({ level }: RiskBadgeProps) {
  const color = level === "high" ? "error" : level === "medium" ? "warning" : "success";
  return <Chip label={level} color={color} size="small" />;
}
