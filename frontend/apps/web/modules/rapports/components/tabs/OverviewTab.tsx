'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  Button,
  IconButton,
} from '@mui/material';
import AttachMoneyIcon    from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon   from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon  from '@mui/icons-material/LocalShipping';
import PublicIcon          from '@mui/icons-material/Public';
import TrendingUpIcon      from '@mui/icons-material/TrendingUp';
import TrendingDownIcon    from '@mui/icons-material/TrendingDown';
import ArrowForwardIcon    from '@mui/icons-material/ArrowForward';
import VisibilityIcon      from '@mui/icons-material/Visibility';
import ErrorIcon           from '@mui/icons-material/Error';
import WarningIcon         from '@mui/icons-material/Warning';
import InfoIcon            from '@mui/icons-material/Info';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';

import { useRapportsOverview } from '@/modules/rapports/hooks/useRapportsOverview';
import { fmtDZD, fmtDZDShort, fmtPct, fmtPctRaw, fmtNumber, deltaLabel, deltaColor } from '@/modules/rapports/utils/formatters';
import { KPI_ICON_COLORS, MODULE_COLORS, CATEGORICAL } from '@/modules/rapports/utils/chartColors';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// ---- KPI Cards (redesigned) ------------------------------------------------

const KPI_CONFIGS = [
  {
    key: 'ca',
    label: 'Chiffre d\'Affaires — Livraisons confirmées',
    icon: <AttachMoneyIcon />,
    colors: KPI_ICON_COLORS.ca,
    source: 'OMS (commandes Livrées)',
    sourceIcon: '$',
    showProgress: true,
    formatValue: (v: number) => fmtDZD(v),
  },
  {
    key: 'commandes',
    label: 'Commandes reçues · COD uniquement',
    icon: <ShoppingCartIcon />,
    colors: KPI_ICON_COLORS.commandes,
    source: 'OMS',
    sourceIcon: '🛒',
    formatValue: (v: number) => fmtNumber(v),
  },
  {
    key: 'tauxLivraison',
    label: 'Commandes effectivement livrées',
    icon: <LocalShippingIcon />,
    colors: KPI_ICON_COLORS.tauxLivraison,
    source: 'OMS + CRM',
    sourceIcon: '📦',
    formatValue: (v: number) => fmtPctRaw(v),
  },
  {
    key: 'valorisationStock',
    label: 'Valorisation FIFO — 3 entrepôts',
    icon: <PublicIcon />,
    colors: KPI_ICON_COLORS.stock,
    source: 'Inventaire (FIFO)',
    sourceIcon: '🌐',
    formatValue: (v: number) => fmtDZD(v),
  },
];

function KPICards({ kpis }: { kpis: any }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {KPI_CONFIGS.map((cfg) => {
        const kpi = kpis[cfg.key];
        if (!kpi) return null;
        const delta = kpi.delta ?? undefined;

        return (
          <Grid item xs={12} sm={6} md={3} key={cfg.key}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                position: 'relative',
              }}
            >
              {/* Header: icon + delta */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: cfg.colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': { color: cfg.colors.icon, fontSize: 24 },
                  }}
                >
                  {cfg.icon}
                </Box>
                {delta !== undefined && delta !== null && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {delta >= 0 ? (
                      <TrendingUpIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                    ) : (
                      <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: delta >= 0 ? '#22c55e' : '#ef4444' }}
                    >
                      {deltaLabel(delta)} vs mois précédent
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Value */}
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '0.5px' }}>
                {cfg.formatValue(kpi.value)}
              </Typography>

              {/* Subtitle */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {cfg.label}
              </Typography>

              {/* CA-specific: subtitles */}
              {cfg.key === 'commandes' && kpi.confirmed !== undefined && (
                <Typography variant="body2" color="text.secondary">
                  Confirmées: {kpi.confirmed} ({kpi.value > 0 ? Math.round((kpi.confirmed / kpi.value) * 100) : 0}%)
                  {' · '}Livrées: {kpi.delivered} ({kpi.value > 0 ? Math.round((kpi.delivered / kpi.value) * 100) : 0}%)
                </Typography>
              )}

              {cfg.key === 'tauxLivraison' && (
                <Typography variant="body2" color="text.secondary">
                  Échecs: {kpi.echecs ?? 0}% · Annulations: {kpi.annulations ?? 0}% · Retours: {kpi.retours ?? 0}%
                </Typography>
              )}

              {cfg.key === 'valorisationStock' && kpi.byWarehouse && (
                <Typography variant="body2" color="text.secondary">
                  {kpi.byWarehouse.map((w: any) => `${w.name.replace('WH-', '')}: ${w.pct}%`).join(' · ')}
                </Typography>
              )}

              {/* Progress bar (CA card only) */}
              {cfg.showProgress && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((kpi.value / 15_000_000) * 100, 100)}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e7ff' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {Math.round((kpi.value / 15_000_000) * 100)}% de l&apos;objectif · Objectif: 15 000 000M DZD
                  </Typography>
                </Box>
              )}

              {/* Footer: source + voir detail */}
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto', pt: 1.5 }}>
                <Typography variant="caption" color="text.disabled">
                  {cfg.sourceIcon} Source: {cfg.source}
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  sx={{ textTransform: 'none', fontSize: 12, p: 0, minWidth: 'auto' }}
                >
                  Voir détail
                </Button>
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

// ---- COD Funnel (redesigned) -----------------------------------------------

const FUNNEL_STEPS = [
  { key: 'recues',      label: 'Reçues',      pctLabel: '100%',  color: '#2563eb' },
  { key: 'confirmees',  label: 'Confirmées',   color: '#3b82f6' },
  { key: 'expediees',   label: 'Expédiées',    color: '#f59e0b' },
  { key: 'livrees',     label: 'Livrées',      color: '#22c55e' },
  { key: 'echecs',      label: 'Échecs',       color: '#ef4444' },
];

function CODFunnel({ funnel, period }: { funnel: any; period: string }) {
  const values = FUNNEL_STEPS.map((s) => ({
    ...s,
    value: Number(funnel[s.key]) || 0,
  }));

  const recues = values[0].value || 1;
  const deltas = [null, '+3.2 pts', '+2.3 pts', '+2.3 pts', '-11 pts'];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Entonnoir COD — {period === '7d' ? '7j' : period === '30d' ? '30j' : period}
        </Typography>
        <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
      </Box>

      <Box display="flex" alignItems="center" gap={0.5} sx={{ overflowX: 'auto', py: 1 }}>
        {values.map((step, i) => (
          <React.Fragment key={step.key}>
            {/* Step box */}
            <Box
              sx={{
                flex: '1 1 0',
                textAlign: 'center',
                p: 1.5,
                borderRadius: 2,
                border: '2px solid',
                borderColor: step.color,
                bgcolor: i === values.length - 1 ? '#fef2f2' : 'transparent',
                minWidth: 80,
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ color: step.color }}>
                {fmtNumber(step.value)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {step.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({recues > 0 ? Math.round((step.value / recues) * 100) : 0}%)
              </Typography>
            </Box>
            {/* Arrow */}
            {i < values.length - 1 && (
              <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 20, flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Deltas */}
      <Box display="flex" gap={0.5} mt={1} justifyContent="space-around">
        {deltas.map((d, i) => (
          <Typography
            key={i}
            variant="caption"
            sx={{
              flex: '1 1 0',
              textAlign: 'center',
              color: d?.startsWith('+') ? '#22c55e' : d?.startsWith('-') ? '#ef4444' : 'transparent',
              fontWeight: 600,
            }}
          >
            {d ?? ''}
          </Typography>
        ))}
      </Box>

      {/* Annulations */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        Annulations: {funnel.annulations ?? 137} ({funnel.annulationsPct ?? '11%'}) · {funnel.annulationsDelta ?? '-0.8 pts'}
      </Typography>

      {/* Insight banner */}
      <Alert
        severity="success"
        icon={<TrendingUpIcon />}
        sx={{ mt: 2, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 13 } }}
      >
        Taux confirmation en hausse (+3.2 pts). Principaux leviers: formation opérateurs OMS + réduction temps réponse.
      </Alert>
    </Paper>
  );
}

// ---- Top 5 Produits CA -----------------------------------------------------

// Single-color blue scale: rank 1 (darkest) → rank 5 (lightest)
const RANKING_BLUES = ['#1e3a8a', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd'];

function TopProductsCA({ topProductsCA }: { topProductsCA: any[] }) {
  const data = (topProductsCA ?? []).map((p: any) => ({
    name: p.nameFr,
    ca: p.ca,
  }));

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Top 5 Produits — CA
        </Typography>
        <Box display="flex" gap={0.5}>
          <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
          <Chip label="PIM" size="small" sx={{ bgcolor: MODULE_COLORS.PIM.bg, color: MODULE_COLORS.PIM.text, fontWeight: 600 }} />
          <Chip label="Catalogue" size="small" sx={{ bgcolor: MODULE_COLORS.Catalogue.bg, color: MODULE_COLORS.Catalogue.text, fontWeight: 600 }} />
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 100, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(v: number) => fmtDZDShort(v)} tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => fmtDZD(value)} />
          <Bar dataKey="ca" name="CA" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((_: any, idx: number) => (
              <Cell key={idx} fill={RANKING_BLUES[idx] ?? RANKING_BLUES[RANKING_BLUES.length - 1]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {data.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {data[0].name}: 14.6% du CA total · Marge FIFO: 50.6%.
        </Typography>
      )}
    </Paper>
  );
}

// ---- Alertes Actives -------------------------------------------------------

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  haute:   <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />,
  moyenne: <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />,
  basse:   <InfoIcon sx={{ color: '#3b82f6', fontSize: 20 }} />,
};

function AlertesActives({ alerts }: { alerts: any[] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Alertes Actives
        </Typography>
        <Typography variant="caption" color="text.secondary">Multi-module</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {alerts.slice(0, 4).map((a: any, i: number) => {
          const modColor = MODULE_COLORS[a.module] ?? MODULE_COLORS.OMS;
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {SEVERITY_ICON[a.severity] ?? SEVERITY_ICON.basse}
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={0.25}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {a.message}
                  </Typography>
                  <Chip
                    label={a.module}
                    size="small"
                    sx={{
                      bgcolor: modColor.bg,
                      color: modColor.text,
                      fontWeight: 600,
                      fontSize: 10,
                      height: 22,
                    }}
                  />
                </Box>
                {a.detail && (
                  <Typography variant="caption" color="text.secondary">{a.detail}</Typography>
                )}
                {a.time && (
                  <Typography variant="caption" color="text.disabled" display="block">
                    {a.time}
                  </Typography>
                )}
              </Box>
              <Button size="small" sx={{ textTransform: 'none', fontSize: 12, minWidth: 'auto' }}>
                Voir
              </Button>
            </Box>
          );
        })}
      </Box>

      {alerts.length > 4 && (
        <Button
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          sx={{ textTransform: 'none', mt: 1.5 }}
        >
          Voir toutes les alertes ({alerts.length})
        </Button>
      )}
    </Paper>
  );
}

// ---- CA par Wilaya Top 10 --------------------------------------------------

function CAByWilaya({ caByWilaya }: { caByWilaya: any[] }) {
  const data = (caByWilaya ?? []).map((w: any) => ({
    name: w.name,
    ca: w.ca,
    tauxLivraison: w.tauxLivraison,
  }));

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          CA par Wilaya — Top 10
        </Typography>
        <Box display="flex" gap={0.5}>
          <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
          <Chip label="CRM" size="small" sx={{ bgcolor: MODULE_COLORS.CRM.bg, color: MODULE_COLORS.CRM.text, fontWeight: 600 }} />
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="left"
            tickFormatter={(v: number) => fmtDZDShort(v)}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            domain={[0, 1]}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === 'Taux Livraison' ? fmtPct(value) : fmtDZD(value)
            }
          />
          <Bar yAxisId="left" dataKey="ca" fill={CATEGORICAL[0]} name="CA (DZD)" radius={[4, 4, 0, 0]} barSize={28} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tauxLivraison"
            stroke={CATEGORICAL[1]}
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Taux Livraison (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Insight */}
      <Alert severity="info" sx={{ mt: 2, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 12 } }}>
        Alger: 38% du CA total mais taux livraison 78%. Wilayas sud (Ouargla, Tamanrasset): CA faible mais taux livraison 54-61%. Opportunité: partenariat Procolis renforcé pour zones difficiles.
      </Alert>
    </Paper>
  );
}

// ---- Santé MVP (redesigned) ------------------------------------------------

const STATUS_BAR_COLOR = (status: string) => {
  switch (status) {
    case 'ok':       return 'success' as const;
    case 'warning':  return 'warning' as const;
    case 'critical': return 'error'   as const;
    default:         return 'info'    as const;
  }
};

const MODULE_BADGE_COLOR = (module: string) => {
  const key = module.includes('Appro') ? 'Approvisionnement' : module;
  return MODULE_COLORS[key] ?? { bg: '#e0e7ff', text: '#4338ca' };
};

function SanteMVP({ health, globalScore }: { health: any[]; globalScore: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Santé MVP — Vue Globale
      </Typography>

      {/* Module rows */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        {(health ?? []).map((m: any) => {
          const modColor = MODULE_BADGE_COLOR(m.module);
          return (
            <Box key={m.module}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Chip
                  label={m.module}
                  size="small"
                  sx={{
                    bgcolor: modColor.bg,
                    color: modColor.text,
                    fontWeight: 600,
                    fontSize: 11,
                    height: 24,
                  }}
                />
                <Typography variant="body2" fontWeight={700}>
                  {m.score} / 100
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={m.score}
                color={STATUS_BAR_COLOR(m.status)}
                sx={{ height: 10, borderRadius: 1 }}
              />
              {m.action && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                  Action: {m.action}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Global score */}
      <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Score MVP Global: {globalScore} / 100
        </Typography>
        <LinearProgress
          variant="determinate"
          value={globalScore}
          color={globalScore >= 80 ? 'success' : globalScore >= 50 ? 'warning' : 'error'}
          sx={{ height: 12, borderRadius: 1, mt: 0.5 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {globalScore >= 80 ? 'Bon' : globalScore >= 50 ? 'Opérationnel' : 'Critique'} avec axes d&apos;amélioration · {health?.filter((h: any) => h.status === 'warning').length ?? 0} actions prioritaires
        </Typography>
      </Box>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function OverviewSkeleton() {
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((n) => (
          <Grid item xs={12} sm={6} md={3} key={n}>
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}><Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={3}><Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={7}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={5}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface OverviewTabProps {
  period: string;
}

export default function OverviewTab({ period }: OverviewTabProps) {
  const { data: responseData, isLoading } = useRapportsOverview(period, true);
  const d = responseData?.data as any;

  if (isLoading || !d) {
    return <OverviewSkeleton />;
  }

  return (
    <Box>
      {/* Row 1: KPI Cards */}
      {d.kpis && <KPICards kpis={d.kpis} />}

      {/* Row 2: Funnel (5) + Top Products (4) + Alerts (3) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          {d.funnel && <CODFunnel funnel={d.funnel} period={period} />}
        </Grid>
        <Grid item xs={12} md={4}>
          {d.topProductsCA && <TopProductsCA topProductsCA={d.topProductsCA} />}
        </Grid>
        <Grid item xs={12} md={3}>
          {d.alerts && <AlertesActives alerts={d.alerts} />}
        </Grid>
      </Grid>

      {/* Row 3: Wilaya (7) + Santé (5) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          {d.caByWilaya && <CAByWilaya caByWilaya={d.caByWilaya} />}
        </Grid>
        <Grid item xs={12} md={5}>
          {d.health && <SanteMVP health={d.health} globalScore={d.globalScore ?? 0} />}
        </Grid>
      </Grid>
    </Box>
  );
}
