"use client";

import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { BonCommande } from "@ferza/shared";

type ProcurementAlert = {
  id: string;
  type?: string;
  severity: "info" | "warning" | "error";
  message: string;
  reference?: string;
};

type LineSeries = {
  label: string;
  color: string;
  values: number[];
};

type BarDatum = {
  label: string;
  value: number;
  color: string;
};

type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type GroupedBarDatum = {
  label: string;
  planned: number;
  actual: number;
};

type ProcurementAnalyticsProps = {
  rows: BonCommande[];
  alerts: ProcurementAlert[];
};

const buildPoints = (values: number[], width: number, height: number, padding = 8) => {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const safeIndex = values.length === 1 ? 0 : index / (values.length - 1);
      const x = padding + safeIndex * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const buildLinePath = (values: number[], width: number, height: number, padding = 8) => {
  const points = buildPoints(values, width, height, padding).split(" ");
  return `M ${points.join(" L ")}`;
};

function LineAreaChart({ series }: { series: LineSeries[] }) {
  const width = 320;
  const height = 140;
  const area = series[0];
  const areaPath = buildLinePath(area.values, width, height);
  const areaPoints = buildPoints(area.values, width, height);
  const areaFill = `${areaPoints} ${width - 8},${height - 8} 8,${height - 8}`;

  return (
    <Box sx={{ width: "100%", height: 160 }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id="procurementAreaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={area.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={area.color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <g stroke="#E2E8F0" strokeWidth="1">
          {Array.from({ length: 4 }).map((_, index) => (
            <line
              key={index}
              x1="8"
              x2={width - 8}
              y1={12 + index * 32}
              y2={12 + index * 32}
            />
          ))}
        </g>
        <polygon points={areaFill} fill="url(#procurementAreaFill)" />
        <path d={areaPath} fill="none" stroke={area.color} strokeWidth="2.5" />
        {series.slice(1).map((item) => (
          <polyline
            key={item.label}
            points={buildPoints(item.values, width, height)}
            fill="none"
            stroke={item.color}
            strokeWidth="2"
          />
        ))}
      </svg>
    </Box>
  );
}

function HorizontalBarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Stack spacing={1.2}>
      {data.map((item) => (
        <Stack key={item.label} spacing={0.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.value}%
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 8,
              borderRadius: 999,
              backgroundColor: "#E2E8F0",
              overflow: "hidden"
            }}
          >
            <Box
              sx={{
                width: `${(item.value / max) * 100}%`,
                height: "100%",
                backgroundColor: item.color
              }}
            />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Box sx={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="12" />
        {segments.map((seg) => {
          const dash = (seg.value / total) * circumference;
          const dashArray = `${dash} ${circumference - dash}`;
          const dashOffset = -offset;
          offset += dash;
          return (
            <circle
              key={seg.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {segments.reduce((sum, segment) => sum + segment.value, 0)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          BCs suivis
        </Typography>
      </Box>
    </Box>
  );
}

function GroupedBarChart({ data }: { data: GroupedBarDatum[] }) {
  const max = Math.max(...data.flatMap((item) => [item.planned, item.actual]), 1);

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", height: 160 }}>
      {data.map((item) => (
        <Stack key={item.label} spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <Stack direction="row" spacing={0.5} alignItems="flex-end">
            <Box
              sx={{
                width: 18,
                height: `${(item.planned / max) * 120}px`,
                backgroundColor: "#BFDBFE",
                borderRadius: 1
              }}
            />
            <Box
              sx={{
                width: 18,
                height: `${(item.actual / max) * 120}px`,
                backgroundColor: "#1D4ED8",
                borderRadius: 1
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}

function AnalyticsCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0", height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ marginBottom: 1 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {subtitle}
          </Typography>
        ) : null}
        <Box sx={{ marginTop: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

const formatCompactDZD = (value: number) =>
  `${new Intl.NumberFormat("fr-DZ", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value)} DZD`;

const shortLabel = (value: string, max = 10) => (value.length > max ? `${value.slice(0, max)}…` : value);

const getReceivedRatio = (bc: BonCommande) => {
  const ordered = bc.items.reduce((sum, item) => sum + item.quantityOrdered, 0);
  const received = bc.items.reduce((sum, item) => sum + item.quantityReceived, 0);
  return ordered > 0 ? Math.min(1, received / ordered) : 0;
};

const diffInDays = (from: string | null, to: string | null) => {
  if (!from || !to) return null;
  const diff = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(diff)) return null;
  return Math.max(0, Math.round(diff / 86400000));
};

const isReceiptActive = (status: BonCommande["status"]) =>
  ["Approved", "SentToSupplier", "PartiallyReceived"].includes(status);

export default function ProcurementAnalytics({ rows, alerts }: ProcurementAnalyticsProps) {
  if (rows.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700}>
            Analytique Approvisionnement
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Les graphiques seront disponibles dès que des bons de commande seront chargés.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const alertCount = alerts.filter((alert) => alert.severity !== "info").length;
  const totalSpend = rows.reduce((sum, row) => sum + row.totalTTC, 0);
  const receivedValue = rows.reduce((sum, row) => sum + row.totalTTC * getReceivedRatio(row), 0);
  const lateOrders = rows.filter(
    (row) =>
      row.expectedDeliveryDate &&
      isReceiptActive(row.status) &&
      new Date(row.expectedDeliveryDate).getTime() < now.getTime()
  ).length;

  const weeklyBuckets = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (5 - index) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  });

  const spendSeries: LineSeries[] = [
    {
      label: "Commandé",
      color: "#2563EB",
      values: weeklyBuckets.map(({ start, end }) =>
        rows
          .filter((row) => {
            const createdAt = new Date(row.createdAt);
            return createdAt >= start && createdAt < end;
          })
          .reduce((sum, row) => sum + row.totalTTC, 0)
      )
    },
    {
      label: "Réceptionné",
      color: "#16A34A",
      values: weeklyBuckets.map(({ start, end }) =>
        rows
          .filter((row) => {
            const createdAt = new Date(row.createdAt);
            return createdAt >= start && createdAt < end;
          })
          .reduce((sum, row) => sum + row.totalTTC * getReceivedRatio(row), 0)
      )
    }
  ];

  const supplierPerformance: BarDatum[] = Object.values(
    rows.reduce<Record<string, { label: string; ordered: number; received: number }>>((acc, row) => {
      const entry = acc[row.supplierName] ?? {
        label: row.supplierName,
        ordered: 0,
        received: 0
      };
      entry.ordered += row.items.reduce((sum, item) => sum + item.quantityOrdered, 0);
      entry.received += row.items.reduce((sum, item) => sum + item.quantityReceived, 0);
      acc[row.supplierName] = entry;
      return acc;
    }, {})
  )
    .map((entry) => {
      const value = entry.ordered > 0 ? Math.round((entry.received / entry.ordered) * 100) : 0;
      return {
        label: entry.label,
        value,
        color: value >= 85 ? "#16A34A" : value >= 50 ? "#1D4ED8" : "#D97706"
      };
    })
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);

  const statusSegments: DonutSegment[] = [
    {
      label: "Réceptionné",
      value: rows.filter((row) => ["FullyReceived", "Invoiced"].includes(row.status)).length,
      color: "#16A34A"
    },
    {
      label: "En cours",
      value: rows.filter((row) => ["Approved", "SentToSupplier", "PartiallyReceived"].includes(row.status)).length,
      color: "#1D4ED8"
    },
    {
      label: "En attente",
      value: rows.filter((row) => row.status === "PendingApproval").length,
      color: "#F59E0B"
    },
    {
      label: "Brouillon",
      value: rows.filter((row) => row.status === "Draft").length,
      color: "#94A3B8"
    },
    {
      label: "Rejeté",
      value: rows.filter((row) => ["Rejected", "Cancelled"].includes(row.status)).length,
      color: "#EF4444"
    }
  ].filter((segment) => segment.value > 0);

  const delayData: GroupedBarDatum[] = Object.values(
    rows.reduce<
      Record<
        string,
        { label: string; plannedValues: number[]; actualValues: number[] }
      >
    >((acc, row) => {
      const entry = acc[row.supplierName] ?? {
        label: shortLabel(row.supplierName, 8),
        plannedValues: [],
        actualValues: []
      };
      const planned = diffInDays(row.createdAt, row.expectedDeliveryDate);
      const actual = diffInDays(row.createdAt, row.updatedAt);
      if (planned !== null) entry.plannedValues.push(planned);
      if (actual !== null) entry.actualValues.push(actual);
      acc[row.supplierName] = entry;
      return acc;
    }, {})
  )
    .map((entry) => ({
      label: entry.label,
      planned:
        entry.plannedValues.length > 0
          ? Math.round(
              entry.plannedValues.reduce((sum, value) => sum + value, 0) /
                entry.plannedValues.length
            )
          : 0,
      actual:
        entry.actualValues.length > 0
          ? Math.round(
              entry.actualValues.reduce((sum, value) => sum + value, 0) /
                entry.actualValues.length
            )
          : 0
    }))
    .slice(0, 6);

  const visibleAlerts = alerts.slice(0, 4);

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          ANALYTIQUES – DONNÉES TEMPS RÉEL
        </Typography>
        <Chip label={`${alertCount} alertes`} size="small" sx={{ backgroundColor: "#FFF7ED", color: "#C2410C" }} />
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Box sx={{ flex: 1.4 }}>
          <AnalyticsCard title="Dépenses vs Réceptions" subtitle="Fenêtre glissante sur 6 semaines">
            <LineAreaChart series={spendSeries} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Commandé: ${formatCompactDZD(totalSpend)}`} size="small" sx={{ backgroundColor: "#DBEAFE" }} />
              <Chip label={`Réceptionné: ${formatCompactDZD(receivedValue)}`} size="small" sx={{ backgroundColor: "#DCFCE7" }} />
              <Chip
                label={`À recevoir: ${formatCompactDZD(Math.max(totalSpend - receivedValue, 0))}`}
                size="small"
                sx={{ backgroundColor: "#FEF3C7" }}
              />
            </Stack>
          </AnalyticsCard>
        </Box>

        <Box sx={{ flex: 1 }}>
          <AnalyticsCard title="Couverture Fournisseurs" subtitle="Part des quantités déjà réceptionnées">
            <HorizontalBarChart data={supplierPerformance.length > 0 ? supplierPerformance : [{ label: "N/A", value: 0, color: "#94A3B8" }]} />
            <Box sx={{ marginTop: 1.5, padding: "8px 12px", borderRadius: 2, backgroundColor: "#EFF6FF" }}>
              <Typography variant="caption" color="#1D4ED8">
                {lateOrders > 0
                  ? `${lateOrders} BC en retard nécessitent une relance fournisseur.`
                  : "Aucun retard critique détecté sur les BC en cours."}
              </Typography>
            </Box>
          </AnalyticsCard>
        </Box>

        <Box sx={{ flex: 1 }}>
          <AnalyticsCard title="Pipeline des BC" subtitle="Répartition par état opérationnel">
            <Stack direction="row" spacing={2} alignItems="center">
              <DonutChart segments={statusSegments.length > 0 ? statusSegments : [{ label: "Aucun", value: 1, color: "#CBD5E1" }]} />
              <Stack spacing={1}>
                {statusSegments.map((segment) => (
                  <Stack key={segment.label} direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: segment.color }} />
                    <Typography variant="caption" color="text.secondary">
                      {segment.label}
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {segment.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </AnalyticsCard>
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Box sx={{ flex: 1.1 }}>
          <AnalyticsCard title="Délais Prévu vs Réel" subtitle="Moyenne par fournisseur">
            <GroupedBarChart data={delayData.length > 0 ? delayData : [{ label: "N/A", planned: 0, actual: 0 }]} />
          </AnalyticsCard>
        </Box>

        <Box sx={{ flex: 0.9 }}>
          <AnalyticsCard title="Alertes Approvisionnement" subtitle="Blocages et anomalies à traiter">
            <Stack spacing={1.25}>
              {visibleAlerts.length > 0 ? (
                visibleAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      padding: "10px 12px",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor:
                        alert.severity === "error"
                          ? "#FECACA"
                          : alert.severity === "warning"
                          ? "#FDE68A"
                          : "#BFDBFE",
                      backgroundColor:
                        alert.severity === "error"
                          ? "#FEF2F2"
                          : alert.severity === "warning"
                          ? "#FFFBEB"
                          : "#EFF6FF"
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} sx={{ display: "block", marginBottom: 0.5 }}>
                      {alert.reference ?? alert.type ?? "Alerte"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.message}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucune alerte active sur l’approvisionnement.
                </Typography>
              )}
            </Stack>
          </AnalyticsCard>
        </Box>
      </Stack>
    </Stack>
  );
}
