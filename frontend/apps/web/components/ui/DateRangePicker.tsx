"use client";

import { Stack, TextField } from "@mui/material";

export default function DateRangePicker() {
  return (
    <Stack direction="row" spacing={2}>
      <TextField label="From" size="small" />
      <TextField label="To" size="small" />
    </Stack>
  );
}
