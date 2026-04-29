"use client";

import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import {
  CloseRounded,
  PendingActionsOutlined,
  ReportProblemOutlined
} from "@mui/icons-material";
import type { ReactNode } from "react";

type AlertBannerProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  onClose: () => void;
  icon: ReactNode;
  tone: {
    background: string;
    border: string;
    icon: string;
  };
};

function AlertBanner({
  title,
  description,
  actionLabel,
  onAction,
  onClose,
  icon,
  tone
}: AlertBannerProps) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${tone.border}`,
        backgroundColor: tone.background,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap"
      }}
    >
      <Box sx={{ color: tone.icon, display: "flex", alignItems: "center" }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 240 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          variant="contained"
          onClick={onAction}
          sx={{
            backgroundColor: "#0F4C81",
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#0B3B66" }
          }}
        >
          {actionLabel}
        </Button>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

type ProcurementAlertsProps = {
  pendingApprovals: number;
  stockAlerts: number;
  showApprovalAlert: boolean;
  showStockAlert: boolean;
  onOpenApprovals?: () => void;
  onCreateGroupedBC?: () => void;
  onCloseApproval: () => void;
  onCloseStock: () => void;
};

export default function ProcurementAlerts({
  pendingApprovals,
  stockAlerts,
  showApprovalAlert,
  showStockAlert,
  onOpenApprovals,
  onCreateGroupedBC,
  onCloseApproval,
  onCloseStock
}: ProcurementAlertsProps) {
  const approvalTitle =
    pendingApprovals > 0
      ? `${pendingApprovals} bon(s) de commande en attente d'approbation`
      : "Aucun bon de commande en attente d'approbation";
  const stockTitle =
    stockAlerts > 0
      ? `${stockAlerts} alerte(s) de réapprovisionnement active(s)`
      : "Aucune alerte de réapprovisionnement active";

  return (
    <Stack spacing={1.5}>
      {showApprovalAlert ? (
        <AlertBanner
          title={approvalTitle}
          description="Ces BC ne peuvent être envoyés aux fournisseurs qu'après approbation (règle SoD)."
          actionLabel="Approuver maintenant"
          onAction={onOpenApprovals}
          icon={<PendingActionsOutlined />}
          onClose={onCloseApproval}
          tone={{
            background: "#FFF7D6",
            border: "#FCD34D",
            icon: "#F59E0B"
          }}
        />
      ) : null}
      {showStockAlert ? (
        <AlertBanner
          title={stockTitle}
          description="Stock inventaire sous seuil : BC automatique suggéré pour 5 articles."
          actionLabel="Créer BC groupée"
          onAction={onCreateGroupedBC}
          icon={<ReportProblemOutlined />}
          onClose={onCloseStock}
          tone={{
            background: "#FFE4E6",
            border: "#FCA5A5",
            icon: "#EF4444"
          }}
        />
      ) : null}
    </Stack>
  );
}
