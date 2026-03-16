"use client";

import { Stack, Typography } from "@mui/material";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Stack spacing={1} alignItems="center" padding={4}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description ?? "Nothing to show yet."}
      </Typography>
    </Stack>
  );
}
