"use client";

import { alpha, useTheme, type Theme } from "@mui/material/styles";
import { Box, Paper, Stack, Typography } from "@mui/material";

function resolveColor(theme: Theme, value: string): string {
  if (!value) return theme.palette.text.primary;
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) return value;
  const parts = value.split('.');
  let cur: any = theme.palette;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return value;
  }
  return typeof cur === 'string' ? cur : value;
}

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string;
  helper?: string;
  trend?: {
    label: string;
    color: string;
  };
  progress?: {
    value: number;
    color: string;
    label: string;
  };
};

export default function StatCard({
  title,
  value,
  icon,
  accentColor,
  helper,
  trend,
  progress
}: StatCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const accent = resolveColor(theme, accentColor);
  const trendColor = trend ? resolveColor(theme, trend.color) : '';
  const progressColor = progress ? resolveColor(theme, progress.color) : '';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid",
        borderColor: isDark ? "rgba(148, 163, 184, 0.12)" : "divider",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "background.paper",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s ease-in-out, border-color 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: isDark ? alpha(accent, 0.4) : accent,
        }
      }}
    >
      {/* Accent Background Glow */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(accent, 0.15)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ zIndex: 1 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDark ? alpha(accent, 1) : accent,
            backgroundColor: isDark ? alpha(accent, 0.15) : alpha(accent, 0.1),
            border: "1px solid",
            borderColor: alpha(accent, 0.2),
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary", letterSpacing: "-0.02em" }}>
            {value}
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mt: 2, zIndex: 1 }}>
        {progress ? (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {progress.label}
              </Typography>
              <Typography variant="caption" fontWeight={800} sx={{ color: progressColor }}>
                {progress.value}%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 6,
                borderRadius: 999,
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "action.hover",
                overflow: "hidden"
              }}
            >
              <Box
                sx={{
                  width: `${progress.value}%`,
                  height: "100%",
                  backgroundColor: progressColor,
                  boxShadow: `0 0 10px ${alpha(progressColor, 0.5)}`,
                }}
              />
            </Box>
          </Box>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            {trend && (
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1.5,
                  bgcolor: alpha(trendColor, 0.12),
                  border: "1px solid",
                  borderColor: alpha(trendColor, 0.2)
                }}
              >
                <Typography variant="caption" sx={{ color: trendColor, fontWeight: 800 }}>
                  {trend.label}
                </Typography>
              </Box>
            )}
            {helper && (
              <Typography variant="caption" fontWeight={600} color="text.disabled">
                {helper}
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
