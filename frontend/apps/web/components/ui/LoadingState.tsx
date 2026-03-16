"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <CircularProgress size={20} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
