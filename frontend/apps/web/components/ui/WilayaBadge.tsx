"use client";

import { Chip } from "@mui/material";

type WilayaBadgeProps = {
  label: string;
};

export default function WilayaBadge({ label }: WilayaBadgeProps) {
  return <Chip label={label} variant="outlined" size="small" />;
}
