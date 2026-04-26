"use client";

import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";

export type ProcurementTabValue = "list" | "alerts" | "suppliers" | "receipts" | "analytics";

type TabLabelProps = {
  label: string;
  badge?: string | number;
  badgeTone?: "blue" | "red" | "green" | "purple" | "orange";
};

const badgeStyles = (tone: TabLabelProps["badgeTone"]) => {
  switch (tone) {
    case "red":
      return { backgroundColor: "#FEE2E2", color: "#DC2626" };
    case "green":
      return { backgroundColor: "#DCFCE7", color: "#16A34A" };
    case "purple":
      return { backgroundColor: "#EDE9FE", color: "#7C3AED" };
    case "orange":
      return { backgroundColor: "#FEF3C7", color: "#D97706" };
    default:
      return { backgroundColor: "#DBEAFE", color: "#2563EB" };
  }
};

function TabLabel({ label, badge, badgeTone }: TabLabelProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
      {badge !== undefined ? (
        <Box
          sx={{
            padding: "2px 8px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            ...badgeStyles(badgeTone)
          }}
        >
          {badge}
        </Box>
      ) : null}
    </Stack>
  );
}

type ProcurementTabsProps = {
  value: ProcurementTabValue;
  onChange: (value: ProcurementTabValue) => void;
  counts: {
    list: number;
    alerts: number;
    suppliers: number;
    receipts: number;
  };
};

export default function ProcurementTabs({ value, onChange, counts }: ProcurementTabsProps) {
  return (
    <Tabs
      value={value}
      onChange={(_event, newValue) => onChange(newValue as ProcurementTabValue)}
      TabIndicatorProps={{ sx: { display: "none" } }}
      sx={{
        padding: "8px 16px 0",
        "& .MuiTabs-flexContainer": {
          gap: 1,
          flexWrap: "wrap"
        }
      }}
    >
      <Tab
        value="list"
        label={<TabLabel label="Bons de Commande" badge={counts.list} />}
        sx={{
          alignItems: "flex-start",
          borderRadius: 2,
          textTransform: "none",
          border: "1px solid",
          borderColor: value === "list" ? "#2563EB" : "#E2E8F0",
          backgroundColor: value === "list" ? "#EFF6FF" : "transparent"
        }}
      />
      <Tab
        value="alerts"
        label={<TabLabel label="Alertes Réappro." badge={counts.alerts} badgeTone="red" />}
        sx={{
          alignItems: "flex-start",
          borderRadius: 2,
          textTransform: "none",
          border: "1px solid",
          borderColor: value === "alerts" ? "#EF4444" : "#E2E8F0",
          backgroundColor: value === "alerts" ? "#FEE2E2" : "transparent"
        }}
      />
      <Tab
        value="suppliers"
        label={<TabLabel label="Fournisseurs" badge={counts.suppliers} badgeTone="blue" />}
        sx={{
          alignItems: "flex-start",
          borderRadius: 2,
          textTransform: "none",
          border: "1px solid",
          borderColor: value === "suppliers" ? "#2563EB" : "#E2E8F0",
          backgroundColor: value === "suppliers" ? "#EFF6FF" : "transparent"
        }}
      />
      <Tab
        value="receipts"
        label={<TabLabel label="Réceptions" badge={counts.receipts} badgeTone="green" />}
        sx={{
          alignItems: "flex-start",
          borderRadius: 2,
          textTransform: "none",
          border: "1px solid",
          borderColor: value === "receipts" ? "#22C55E" : "#E2E8F0",
          backgroundColor: value === "receipts" ? "#DCFCE7" : "transparent"
        }}
      />
      <Tab
        value="analytics"
        label={<TabLabel label="Analytiques" badge="LIVE" badgeTone="purple" />}
        sx={{
          alignItems: "flex-start",
          borderRadius: 2,
          textTransform: "none",
          border: "1px solid",
          borderColor: value === "analytics" ? "#7C3AED" : "#E2E8F0",
          backgroundColor: value === "analytics" ? "#EDE9FE" : "transparent"
        }}
      />
    </Tabs>
  );
}
