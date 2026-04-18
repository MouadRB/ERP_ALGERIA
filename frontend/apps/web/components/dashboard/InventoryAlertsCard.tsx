"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import type { InventoryAlertVM, InventoryAlertsVM } from "@/modules/dashboard/types";

type Props = {
  data: InventoryAlertsVM | null;
};

const toneColor = (theme: Theme, tone: InventoryAlertVM['level']['tone']): string => {
  switch (tone) {
    case 'error':
      return theme.palette.error.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'info':
    default:
      return theme.palette.info?.main ?? theme.palette.primary.main;
  }
};

export default function InventoryAlertsCard({ data }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string | undefined) ?? 'fr';

  if (!data) return null;
  const { items, criticalCount } = data;

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
          Alertes Inventaire
        </Typography>
        <Box
          sx={{
            bgcolor: alpha(theme.palette.error.main, 0.15),
            color: 'error.main',
            px: 1,
            py: 0.3,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700
          }}
        >
          {criticalCount} critiques
        </Box>
      </Stack>

      <Stack spacing={2}>
        {items.map((item) => {
          const color = toneColor(theme, item.level.tone);
          return (
            <Stack key={item.sku} direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  minWidth: 72,
                  textAlign: "center",
                  bgcolor: alpha(color, 0.15),
                  color,
                  fontWeight: 700,
                  fontSize: 11,
                  px: 1,
                  py: 0.4,
                  borderRadius: 999
                }}
              >
                {item.level.label}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {item.product}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.details}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => router.push(`/${locale}/inventory/${item.sku}`)}
                sx={{ textTransform: "none" }}
              >
                Reapprovisionner
              </Button>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
