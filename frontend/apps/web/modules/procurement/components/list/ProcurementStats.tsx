"use client";

import { Box, Card, CardContent, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import {
  BarChartOutlined,
  LocalShippingOutlined,
  PendingActionsOutlined,
  ReportProblemOutlined,
  VerifiedOutlined
} from "@mui/icons-material";
import { formatDZD } from "@ferza/shared";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  helper?: string;
  icon: ReactNode;
  accent: string;
  accentSoft: string;
  footer?: ReactNode;
};

function StatCard({
  label,
  value,
  subtitle,
  helper,
  icon,
  accent,
  accentSoft,
  footer
}: StatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "#E2E8F0",
        borderLeft: `4px solid ${accent}`,
        height: "100%"
      }}
    >
      <CardContent sx={{ paddingBottom: "20px !important" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              backgroundColor: accentSoft,
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {icon}
          </Box>
          <Stack spacing={0.4}>
            <Typography variant="h6" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        {helper ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ marginTop: 1, display: "block" }}
          >
            {helper}
          </Typography>
        ) : null}
        {footer ? <Box sx={{ marginTop: 1 }}>{footer}</Box> : null}
      </CardContent>
    </Card>
  );
}

type ProcurementStatsProps = {
  pendingApprovals: number;
  inSupplier: number;
  inTransit: number;
  received: number;
  stockAlerts: number;
  totalSpend: number;
  budget?: number;
};

export default function ProcurementStats({
  pendingApprovals,
  inSupplier,
  inTransit,
  received,
  stockAlerts,
  totalSpend,
  budget = 20_000_000
}: ProcurementStatsProps) {
  const remainingBudget = Math.max(budget - totalSpend, 0);
  const budgetPercent = budget === 0 ? 0 : Math.min((totalSpend / budget) * 100, 100);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} lg={2}>
        <StatCard
          label="À approuver"
          value={pendingApprovals}
          subtitle="SoD – Approbateur requis"
          icon={<PendingActionsOutlined fontSize="small" />}
          accent="#F59E0B"
          accentSoft="#FFF7D6"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2}>
        <StatCard
          label="Chez fournisseur"
          value={inSupplier}
          subtitle="BC approuvés envoyés"
          icon={<LocalShippingOutlined fontSize="small" />}
          accent="#2563EB"
          accentSoft="#DBEAFE"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2}>
        <StatCard
          label="En route"
          value={inTransit}
          subtitle="Réceptions partielles en cours"
          icon={<VerifiedOutlined fontSize="small" />}
          accent="#7C3AED"
          accentSoft="#EDE9FE"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2}>
        <StatCard
          label="Réceptionnés"
          value={received}
          subtitle="BC complètement réceptionnés"
          icon={<VerifiedOutlined fontSize="small" />}
          accent="#22C55E"
          accentSoft="#DCFCE7"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2}>
        <StatCard
          label="Alertes réappro."
          value={stockAlerts}
          subtitle="3 ruptures totales"
          icon={<ReportProblemOutlined fontSize="small" />}
          accent="#EF4444"
          accentSoft="#FEE2E2"
        />
      </Grid>
      <Grid item xs={12} sm={6} lg={2}>
        <StatCard
          label="Dépense ce mois"
          value={formatDZD(totalSpend)}
          icon={<BarChartOutlined fontSize="small" />}
          accent="#2563EB"
          accentSoft="#DBEAFE"
          footer={
            <Stack spacing={0.5}>
              <LinearProgress
                variant="determinate"
                value={budgetPercent}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: "#E2E8F0",
                  "& .MuiLinearProgress-bar": { backgroundColor: "#2563EB" }
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(budgetPercent)}% du budget · {formatDZD(remainingBudget)} restant
              </Typography>
            </Stack>
          }
        />
      </Grid>
    </Grid>
  );
}
