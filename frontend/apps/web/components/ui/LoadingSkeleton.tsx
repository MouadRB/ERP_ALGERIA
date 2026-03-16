"use client";

import { Skeleton, Stack } from "@mui/material";

export default function LoadingSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={32} />
      <Skeleton variant="rectangular" height={160} />
    </Stack>
  );
}
