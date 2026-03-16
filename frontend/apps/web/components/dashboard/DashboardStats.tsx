"use client";

import { Box } from "@mui/material";
import ShoppingCartRounded from "@mui/icons-material/ShoppingCartRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import StatCard from "./StatCard";

export default function DashboardStats() {
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
        value="142"
        icon={<ShoppingCartRounded />}
        accentColor="#1A73E8"
        trend={{ label: "+12% vs hier", color: "#22C55E" }}
      />
      <StatCard
        title="En Attente Confirmation"
        value="23"
        icon={<AccessTimeRounded />}
        accentColor="#F59E0B"
        helper="Delai max 120 min"
      />
      <StatCard
        title="Taux de Livraison"
        value="78.4%"
        icon={<CheckCircleRounded />}
        accentColor="#16A34A"
        progress={{ value: 78, color: "#16A34A", label: "+3.2% cette semaine" }}
      />
      <StatCard
        title="Articles en Rupture"
        value="7"
        icon={<WarningAmberRounded />}
        accentColor="#EF4444"
        trend={{ label: "3 nouveaux aujourd'hui", color: "#EF4444" }}
      />
    </Box>
  );
}
