"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

const rows = [
  { label: "Passees", value: 142, percent: 100, color: "#1D4ED8" },
  { label: "Confirmees", value: 98, percent: 69, color: "#2563EB" },
  { label: "Expediees", value: 67, percent: 47, color: "#7C3AED" },
  { label: "Livrees", value: 41, percent: 29, color: "#16A34A" },
  { label: "Remises", value: 28, percent: 20, color: "#0EA5A4" },
  { label: "Retournees", value: 12, percent: 8, color: "#EF4444" }
];

export default function CodFunnelCard() {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: "1px solid #E6EDF5",
        backgroundColor: "#FFFFFF",
        p: 2.5
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Entonnoir COD - Aujourd&apos;hui
        </Typography>
        <Box
          sx={{
            bgcolor: "#E8F1FF",
            color: "#2563EB",
            fontWeight: 700,
            fontSize: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: 999
          }}
        >
          142 commandes
        </Box>
      </Stack>

      <Stack spacing={1.6}>
        {rows.map((row) => (
          <Box key={row.label}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="caption" sx={{ minWidth: 90, color: "#64748B" }}>
                {row.label}
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  height: 14,
                  backgroundColor: "#EEF2F7",
                  borderRadius: 999,
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                <Box
                  sx={{
                    width: `${row.percent}%`,
                    height: "100%",
                    backgroundColor: row.color,
                    borderRadius: 999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: 700,
                    paddingRight: 1
                  }}
                >
                  {row.value}
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {row.percent}%
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
