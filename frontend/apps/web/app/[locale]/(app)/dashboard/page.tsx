"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ConfirmationTableCard from "@/components/dashboard/ConfirmationTableCard";
import CodFunnelCard from "@/components/dashboard/CodFunnelCard";
import RiskScoreCard from "@/components/dashboard/RiskScoreCard";
import CrmActivityCard from "@/components/dashboard/CrmActivityCard";
import InventoryAlertsCard from "@/components/dashboard/InventoryAlertsCard";
import ProcurementCard from "@/components/dashboard/ProcurementCard";

export default function DashboardPage() {
  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Bonjour, Super Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Voici votre tableau de bord operationnel — Mercredi, 4 Mars 2026
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            sx={{ textTransform: "none", bgcolor: "#F8FAFC" }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            sx={{
              textTransform: "none",
              bgcolor: "#1A4E8A",
              "&:hover": { bgcolor: "#143B68" }
            }}
          >
            Nouvelle Commande
          </Button>
        </Stack>
      </Stack>

      <DashboardStats />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2,
          mt: 2
        }}
      >
        <ConfirmationTableCard />
        <Stack spacing={2}>
          <CodFunnelCard />
          <RiskScoreCard />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
          gap: 2,
          mt: 2
        }}
      >
        <CrmActivityCard />
        <InventoryAlertsCard />
        <ProcurementCard />
      </Box>
    </Box>
  );
}
