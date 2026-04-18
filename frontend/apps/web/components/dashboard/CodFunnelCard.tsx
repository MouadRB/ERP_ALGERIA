"use client";

import { alpha, useTheme, type Theme } from "@mui/material/styles";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { CodFunnelRowVM, CodFunnelVM } from "@/modules/dashboard/types";

type Props = {
  data: CodFunnelVM | null;
};

const resolveToneColor = (theme: Theme, tone: CodFunnelRowVM['tone']): string => {
  switch (tone) {
    case 'primary':
      return theme.palette.primary.main;
    case 'info':
      return theme.palette.info.main;
    case 'secondary':
      return theme.palette.secondary?.main ?? '#805ad5';
    case 'success':
      return theme.palette.success.main;
    case 'teal':
      return '#319795';
    case 'error':
      return theme.palette.error.main;
    default:
      return theme.palette.primary.main;
  }
};

export default function CodFunnelCard({ data }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!data) return null;
  const { total, rows } = data;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        p: 2.5
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          Entonnoir COD - Aujourd&apos;hui
        </Typography>
        <Box
          sx={{
            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : "#E8F1FF",
            color: isDark ? theme.palette.primary.light : "#58a6ff",
            border: isDark ? `1px solid ${theme.palette.primary.main}` : "none",
            fontWeight: 700,
            fontSize: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: '2rem'
          }}
        >
          {total} commandes
        </Box>
      </Stack>

      <Stack spacing={1.6}>
        {rows.map((row) => {
          const color = resolveToneColor(theme, row.tone);
          return (
            <Box key={row.label}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{ minWidth: 90, color: "text.secondary", fontWeight: 500 }}>
                  {row.label}
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 14,
                    backgroundColor: isDark ? "rgba(139, 148, 158, 0.1)" : "action.hover",
                    borderRadius: 999,
                    overflow: "hidden",
                    position: "relative"
                  }}
                >
                  <Box
                    sx={{
                      width: `${row.percent}%`,
                      height: "100%",
                      backgroundColor: color,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: 700,
                      paddingRight: 1
                    }}
                  >
                    {row.value}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {row.percent}%
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
