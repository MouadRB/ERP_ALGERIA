"use client";

import { alpha } from "@mui/material/styles";
import { Box, Paper, Stack, Typography } from "@mui/material";

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
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: "1px solid #E6EDF5",
        borderLeft: `4px solid ${accentColor}`,
        backgroundColor: "#FFFFFF",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        gap: 1.5
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentColor,
            backgroundColor: alpha(accentColor, 0.12)
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Stack>

      {helper && (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      )}

      {progress && (
        <Box>
          <Box
            sx={{
              height: 6,
              borderRadius: 999,
              backgroundColor: "#E9EEF6",
              overflow: "hidden"
            }}
          >
            <Box
              sx={{
                width: `${progress.value}%`,
                height: "100%",
                backgroundColor: progress.color
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {progress.label}
          </Typography>
        </Box>
      )}

      {trend && (
        <Typography variant="caption" sx={{ color: trend.color, fontWeight: 600 }}>
          {trend.label}
        </Typography>
      )}
    </Paper>
  );
}
