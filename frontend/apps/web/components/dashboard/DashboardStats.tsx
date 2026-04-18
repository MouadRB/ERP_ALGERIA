"use client";

import { Box } from "@mui/material";
import ShoppingCartRounded from "@mui/icons-material/ShoppingCartRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import StatCard from "./StatCard";
import type { DashboardStatsVM } from "@/modules/dashboard/types";

type Props = {
  data: DashboardStatsVM | null;
};

export default function DashboardStats({ data }: Props) {
  if (!data) return null;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
        gap: 2
      }}
    >
      <StatCard
        title="Commandes Aujourd'hui"
        value={data.ordersToday.value}
        icon={<ShoppingCartRounded />}
        accentColor="#1A73E8"
        trend={{
          label: data.ordersToday.trendLabel,
          color: data.ordersToday.trendIsPositive ? 'success.main' : 'error.main',
        }}
      />
      <StatCard
        title="En Attente Confirmation"
        value={data.awaitingConfirmation.value}
        icon={<AccessTimeRounded />}
        accentColor="#d29922"
        helper={data.awaitingConfirmation.helper}
      />
      <StatCard
        title="Taux de Livraison"
        value={data.deliveryRate.valueLabel}
        icon={<CheckCircleRounded />}
        accentColor="#2ea043"
        progress={{
          value: data.deliveryRate.progressValue,
          color: 'success.main',
          label: data.deliveryRate.trendLabel,
        }}
      />
      <StatCard
        title="Articles en Rupture"
        value={data.outOfStockItems.value}
        icon={<WarningAmberRounded />}
        accentColor="#f85149"
        trend={{ label: data.outOfStockItems.trendLabel, color: 'error.main' }}
      />
    </Box>
  );
}
