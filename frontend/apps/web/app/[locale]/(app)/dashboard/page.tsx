"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import LoadingState from "@/components/ui/LoadingState";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ConfirmationTableCard from "@/components/dashboard/ConfirmationTableCard";
import CodFunnelCard from "@/components/dashboard/CodFunnelCard";
import RiskScoreCard from "@/components/dashboard/RiskScoreCard";
import CrmActivityCard from "@/components/dashboard/CrmActivityCard";
import InventoryAlertsCard from "@/components/dashboard/InventoryAlertsCard";
import ProcurementCard from "@/components/dashboard/ProcurementCard";
import { useSession } from "@/hooks/shared/useSession";
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";

const formatHeaderDate = (locale: string): string => {
  const bcp47 = locale === 'ar' ? 'ar-DZ' : 'fr-DZ';
  return new Intl.DateTimeFormat(bcp47, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string | undefined) ?? 'fr';
  const { session } = useSession();
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  const headerDate = useMemo(() => formatHeaderDate(locale), [locale]);
  const displayName = session?.nameFr?.trim() || 'Utilisateur';

  if (isLoading) return <LoadingState label="Chargement du tableau de bord..." />;
  if (isError || !data) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Impossible de charger le tableau de bord.
        </Alert>
        <Button variant="outlined" onClick={() => refetch()} startIcon={<RefreshRounded />}>
          Reessayer
        </Button>
      </Box>
    );
  }

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
            Bonjour, {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Voici votre tableau de bord operationnel — {headerDate}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{ textTransform: "none", bgcolor: 'background.paper' }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => router.push(`/${locale}/oms`)}
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

      {data.degraded && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Certaines donnees sont indisponibles - affichage partiel.
        </Alert>
      )}

      <DashboardStats data={data.stats} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2,
          mt: 2
        }}
      >
        <ConfirmationTableCard data={data.confirmations} />
        <Stack spacing={2}>
          <CodFunnelCard data={data.codFunnel} />
          <RiskScoreCard data={data.riskScore} />
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
        <CrmActivityCard data={data.crmActivity} />
        <InventoryAlertsCard data={data.inventoryAlerts} />
        <ProcurementCard data={data.procurement} />
      </Box>
    </Box>
  );
}
