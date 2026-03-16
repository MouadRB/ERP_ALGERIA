"use client";

import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";

const purchaseOrders = [
  {
    id: "BC #0892",
    supplier: "Supplier Express DZ",
    status: "Approbation",
    statusColor: "#F59E0B",
    statusBg: "#FEF3C7",
    delay: "2 jours"
  },
  {
    id: "BC #0891",
    supplier: "TechDistrib Alger",
    status: "Envoye",
    statusColor: "#3B82F6",
    statusBg: "#DBEAFE",
    delay: "Aujourd'hui"
  },
  {
    id: "BC #0890",
    supplier: "Mode & Style SARL",
    status: "Recu",
    statusColor: "#16A34A",
    statusBg: "#DCFCE7",
    delay: "Hier"
  }
];

const receptions = [
  {
    id: "BR #445",
    details: "24 articles - Inventaire non mis a jour",
    status: "Mettre a jour",
    statusColor: "#FFFFFF",
    statusBg: "#1A4E8A"
  },
  {
    id: "BR #444",
    details: "12 articles - En cours de verification",
    status: "En cours",
    statusColor: "#2563EB",
    statusBg: "#DBEAFE"
  }
];

export default function ProcurementCard() {
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
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Approvisionnement
      </Typography>

      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        BONS DE COMMANDE EN ATTENTE
      </Typography>
      <Stack spacing={2} mt={1.5}>
        {purchaseOrders.map((order) => (
          <Stack key={order.id} direction="row" spacing={2} alignItems="center">
            <DescriptionOutlined sx={{ color: "#94A3B8" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={700}>
                {order.id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {order.supplier}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: order.statusBg,
                color: order.statusColor,
                fontWeight: 700,
                fontSize: 11,
                px: 1.5,
                py: 0.5,
                borderRadius: 999
              }}
            >
              {order.status}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {order.delay}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        RECEPTIONS EN ATTENTE
      </Typography>
      <Stack spacing={2} mt={1.5}>
        {receptions.map((receipt) => (
          <Stack key={receipt.id} direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" fontWeight={700}>
              {receipt.id}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
              {receipt.details}
            </Typography>
            {receipt.statusBg === "#1A4E8A" ? (
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: receipt.statusBg,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#143B68" }
                }}
              >
                {receipt.status}
              </Button>
            ) : (
              <Box
                sx={{
                  bgcolor: receipt.statusBg,
                  color: receipt.statusColor,
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
