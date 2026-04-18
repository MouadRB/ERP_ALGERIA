"use client";

import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import StarOutline from "@mui/icons-material/StarOutline";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import type { CrmActivityItemVM } from "@/modules/dashboard/types";

type Props = {
  data: CrmActivityItemVM[] | null;
};

const ICONS: Record<CrmActivityItemVM['iconKey'], React.ReactNode> = {
  absence: <PersonOffOutlined />,
  delivered: <CheckCircleOutline />,
  blacklisted: <ErrorOutline />,
  'segment-change': <StarOutline />,
  otp: <AccessTimeOutlined />,
};

const toneColor = (theme: Theme, tone: CrmActivityItemVM['tone']): string => {
  switch (tone) {
    case 'error':
      return theme.palette.error.main;
    case 'success':
      return theme.palette.success.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'info':
    default:
      return theme.palette.info?.main ?? theme.palette.primary.main;
  }
};

export default function CrmActivityCard({ data }: Props) {
  const theme = useTheme();

  if (!data) return null;

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
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Activite CRM
        </Typography>
        <Box
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.15),
            color: 'success.main',
            px: 1,
            py: 0.3,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700
          }}
        >
          Temps reel
        </Box>
      </Stack>

      <Stack spacing={2}>
        {data.map((item) => {
          const color = toneColor(theme, item.tone);
          return (
            <Stack key={item.key} direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 34, height: 34 }}>
                {ICONS[item.iconKey]}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {item.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.sub}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
