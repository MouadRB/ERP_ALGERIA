"use client";

import { Chip } from "@mui/material";

type ChannelBadgeProps = {
  label: string;
};

export default function ChannelBadge({ label }: ChannelBadgeProps) {
  return <Chip label={label} color="primary" size="small" />;
}
