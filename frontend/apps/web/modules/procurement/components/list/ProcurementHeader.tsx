"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import {
  AddRounded,
  BarChartOutlined,
  FileDownloadOutlined,
  NotificationsNoneOutlined
} from "@mui/icons-material";

type ProcurementHeaderProps = {
  totalCount: number;
  suppliersCount: number;
  stockAlerts: number;
  onNewBC: () => void;
  onAnalytics: () => void;
  onExport?: () => void;
  onShowAlerts?: () => void;
};

export default function ProcurementHeader({
  totalCount,
  suppliersCount,
  stockAlerts,
  onNewBC,
  onAnalytics,
  onExport,
  onShowAlerts
}: ProcurementHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      alignItems={{ xs: "flex-start", lg: "center" }}
      justifyContent="space-between"
      spacing={2}
    >
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Approvisionnement
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalCount} BCs actifs · {suppliersCount} fournisseurs ·
          Valorisation FIFO · Méthode SoD active
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ marginTop: 0.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "success.main"
            }}
          />
          <Typography variant="caption" color="success.main">
            SoD: Créateur ≠ Approbateur · Toujours appliqué
          </Typography>
        </Stack>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        <Button
          variant="text"
          startIcon={<FileDownloadOutlined />}
          onClick={onExport}
          sx={{ color: "text.secondary", textTransform: "none", fontWeight: 600 }}
        >
          Exporter
        </Button>
        <Button
          variant="text"
          startIcon={<BarChartOutlined />}
          onClick={onAnalytics}
          sx={{ color: "text.secondary", textTransform: "none", fontWeight: 600 }}
        >
          Analytiques fournisseurs
        </Button>
        <Button
          variant="outlined"
          startIcon={<NotificationsNoneOutlined />}
          onClick={onShowAlerts}
          sx={{
            borderColor: "#F59E0B",
            color: "#B45309",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "#FFF7ED"
          }}
        >
          Alertes stock
          <Box
            component="span"
            sx={{
              marginLeft: 1,
              padding: "2px 6px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: "#FDE68A",
              color: "#B45309"
            }}
          >
            {stockAlerts}
          </Box>
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={onNewBC}
          sx={{
            backgroundColor: "#0F4C81",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#0B3B66" }
          }}
        >
          Nouveau Bon de Commande
        </Button>
      </Stack>
    </Stack>
  );
}
