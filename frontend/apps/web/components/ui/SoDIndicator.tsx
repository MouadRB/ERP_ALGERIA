"use client";

import { Badge } from "@mui/material";

type SoDIndicatorProps = {
  value: number;
};

export default function SoDIndicator({ value }: SoDIndicatorProps) {
  return <Badge color="secondary" badgeContent={value} />;
}
