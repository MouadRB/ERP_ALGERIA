"use client";

import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import type { ProcurementOrderVM, ProcurementVM } from "@/modules/dashboard/types";

type Props = {
  data: ProcurementVM | null;
};

const toneColor = (theme: Theme, tone: ProcurementOrderVM['status']['tone']): string => {
  switch (tone) {
    case 'warning':
      return theme.palette.warning.main;
    case 'success':
      return theme.palette.success.main;
    case 'info':
    default:
      return theme.palette.info?.main ?? theme.palette.primary.main;
  }
};

export default function ProcurementCard({ data }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string | undefined) ?? 'fr';

  if (!data) return null;
  const { purchaseOrders, receptions } = data;

  const goToBC = (bcId: string) => router.push(`/${locale}/procurement/${bcId}`);

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
        Approvisionnement
      </Typography>

      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        BONS DE COMMANDE EN ATTENTE
      </Typography>
      <Stack spacing={2} mt={1.5}>
        {purchaseOrders.map((order) => {
          const color = toneColor(theme, order.status.tone);
          return (
            <Stack
              key={order.bcId}
              direction="row"
              spacing={2}
              alignItems="center"
              onClick={() => goToBC(order.bcId)}
              sx={{ cursor: "pointer", "&:hover": { opacity: 0.85 } }}
            >
              <DescriptionOutlined sx={{ color: "text.secondary" }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  {order.reference}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.supplier}
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: alpha(color, 0.15),
                  color,
                  fontWeight: 700,
                  fontSize: 11,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999
                }}
              >
                {order.status.label}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {order.delay}
              </Typography>
            </Stack>
          );
        })}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        RECEPTIONS EN ATTENTE
      </Typography>
      <Stack spacing={2} mt={1.5}>
        {receptions.map((receipt) => (
          <Stack key={receipt.bcId} direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" fontWeight={700}>
              {receipt.reference}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
              {receipt.details}
            </Typography>
            {receipt.isActionable ? (
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => goToBC(receipt.bcId)}
                sx={{ textTransform: "none" }}
              >
                {receipt.status}
              </Button>
            ) : (
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.info?.main ?? theme.palette.primary.main, 0.15),
                  color: theme.palette.info?.main ?? theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: 11,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999
                }}
              >
                {receipt.status}
              </Box>
            )}
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
