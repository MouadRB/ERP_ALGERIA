"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import { useTheme, type Theme } from "@mui/material/styles";
import type { RiskScoreSegmentVM, RiskScoreVM } from "@/modules/dashboard/types";

type Props = {
  data: RiskScoreVM | null;
};

const resolveToneColor = (theme: Theme, tone: RiskScoreSegmentVM['tone']): string => {
  switch (tone) {
    case 'success':
      return theme.palette.success.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'error':
      return theme.palette.error.main;
    default:
      return theme.palette.text.primary;
  }
};

export default function RiskScoreCard({ data }: Props) {
  const theme = useTheme();

  if (!data) return null;
  const { total, segments } = data;

  const background = (() => {
    if (total === 0) return `conic-gradient(${theme.palette.action.disabledBackground} 0% 100%)`;
    let cursor = 0;
    const parts = segments.map((segment) => {
      const slice = (segment.value / total) * 100;
      const color = resolveToneColor(theme, segment.tone);
      const part = `${color} ${cursor}% ${cursor + slice}%`;
      cursor += slice;
      return part;
    });
    return `conic-gradient(${parts.join(', ')})`;
  })();

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
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Score de Risque - Commandes du Jour
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2
        }}
      >
        <Box
          sx={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              backgroundColor: "background.paper",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: (t) => `0 0 0 1px ${t.palette.divider}`
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              {total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              commandes
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack spacing={1}>
        {segments.map((segment) => (
          <Stack key={segment.label} direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: resolveToneColor(theme, segment.tone)
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {segment.label}: {segment.value} commandes
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
