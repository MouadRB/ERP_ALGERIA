'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CatalogueEntry } from '../../catalogue.types';
import { formatPercent } from '../../catalogue.ui';

type CatalogueAnalyticsDashboardProps = {
  onCreateProduct: (query: string) => void;
  onDiagnose: (id: string) => void;
  onOpenPim: (productId: string) => void;
  onReindex: () => void;
  reindexPending?: boolean;
  rows: CatalogueEntry[];
};

export default function CatalogueAnalyticsDashboard({
  onCreateProduct,
  onDiagnose,
  onOpenPim,
  onReindex,
  reindexPending,
  rows,
}: CatalogueAnalyticsDashboardProps) {
  const [period, setPeriod] = useState('7');

  const dashboard = useMemo(() => {
    const totalProducts = rows.length;
    const bothChannels = rows.filter((row) => row.channels.length >= 2).length;
    const webOnly = rows.filter((row) => row.channels.length === 1 && row.channels.includes('website')).length;
    const waOnly = rows.filter((row) => row.channels.length === 1 && row.channels.includes('whatsapp')).length;
    const hidden = rows.filter((row) => row.status === 'draft' || row.status === 'masked').length;
    const totalViews = rows.reduce((sum, row) => sum + row.metrics.views7d, 0);
    const avgCtr =
      rows.length > 0
        ? rows.reduce((sum, row) => sum + row.metrics.conversionRate, 0) / rows.length
        : 0;
    const avgAddToCartRate =
      rows.length > 0
        ? rows.reduce((sum, row) => sum + row.metrics.addToCartRate, 0) / rows.length
        : 0;
    const addToCart = rows.reduce((sum, row) => sum + row.metrics.views7d * row.metrics.addToCartRate, 0);
    const conversions = rows.reduce((sum, row) => sum + row.metrics.views7d * row.metrics.conversionRate, 0);
    const topProduct =
      [...rows].sort((left, right) => right.metrics.conversionRate - left.metrics.conversionRate)[0] ?? null;
    const weakProduct =
      [...rows].sort((left, right) => left.metrics.conversionRate - right.metrics.conversionRate)[0] ?? null;
    const alertCount = rows.filter((row) => row.metrics.returnRate >= 0.3).length;

    const topSearches = [...rows]
      .filter((row) => row.metrics.topSearchTerm)
      .map((row) => ({
        label: row.metrics.topSearchTerm,
        value: Math.max(Math.round(row.metrics.views7d * Math.max(row.metrics.conversionRate, 0.02)), 10),
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 8);

    const gaps = rows
      .filter((row) => row.status === 'draft' || !row.openSearchIndexed || row.status === 'masked')
      .slice(0, 6)
      .map((row) => ({
        action: row.status === 'draft' ? 'Creer produit' : 'Lier produit',
        id: row.id,
        label: row.nameFr.split(' - ')[0].toLowerCase(),
        volume: Math.max(Math.round(row.metrics.views7d * Math.max(row.metrics.addToCartRate, 0.05)), 1),
      }));

    const alerts = rows
      .filter((row) => row.status === 'draft' || !row.openSearchIndexed || row.status === 'masked')
      .map((row, index) => ({
        id: row.id,
        level: row.status === 'draft' ? 'Brouillon' : row.status === 'masked' ? 'Normal' : 'Erreur',
        message:
          row.status === 'draft'
            ? 'Non indexe - PIM brouillon - Indexe a l activation PIM'
            : row.status === 'masked'
              ? 'Retire de l index (discontinue)'
              : 'Erreur d indexation - verification requise',
        product: row,
        since: `il y a ${index + 1} h`,
      }))
      .slice(0, 3);

    const publishedCount = rows.filter((row) => row.status === 'published' || row.status === 'partial').length;
    const trend = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index) * 4);
      return {
        label: date.toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' }),
        masked: hidden,
        published: publishedCount,
      };
    });

    return {
      addToCart,
      alertCount,
      avgAddToCartRate,
      alerts,
      avgCtr,
      bothChannels,
      conversions,
      gaps,
      hidden,
      topProduct,
      topSearches,
      totalProducts,
      totalViews,
      trend,
      waOnly,
      weakProduct,
      webOnly,
    };
  }, [rows]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
        <Box />
        <TextField
          select
          size="small"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="7">7 derniers jours</MenuItem>
          <MenuItem value="30">30 derniers jours</MenuItem>
        </TextField>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <ChartCard rows={dashboard.trend} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <PerformanceCard
            addToCart={dashboard.addToCart}
            alertCount={dashboard.alertCount}
            avgAddToCartRate={dashboard.avgAddToCartRate}
            avgCtr={dashboard.avgCtr}
            conversions={dashboard.conversions}
            topProduct={dashboard.topProduct}
            totalViews={dashboard.totalViews}
            weakProduct={dashboard.weakProduct}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CoverageCard
            bothChannels={dashboard.bothChannels}
            hidden={dashboard.hidden}
            total={dashboard.totalProducts}
            waOnly={dashboard.waOnly}
            webOnly={dashboard.webOnly}
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          <TopSearchesCard items={dashboard.topSearches} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <SearchGapCard items={dashboard.gaps} onCreateProduct={onCreateProduct} onOpenProduct={onDiagnose} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <IndexAlertsCard alerts={dashboard.alerts} onOpenPim={onOpenPim} onReindex={onReindex} pending={reindexPending} />
        </Grid>
      </Grid>
    </Box>
  );
}

function ChartCard({ rows }: { rows: Array<{ label: string; masked: number; published: number }> }) {
  const theme = useTheme();
  const totalPublished = rows.reduce((sum, row) => sum + row.published, 0);
  const totalMasked = rows.reduce((sum, row) => sum + row.masked, 0);
  const total = totalPublished + totalMasked;

  const donutData = [
    { name: 'Publies', value: totalPublished, color: theme.palette.success.main },
    { name: 'Masques', value: totalMasked, color: theme.palette.error.main },
  ];

  const stabilite = total > 0 ? Math.round((totalPublished / total) * 100) : 0;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.25, borderColor: 'divider', height: '100%' }}>
      <Typography variant="h6" fontWeight={800}>Publication & Ruptures (30j)</Typography>
      <Box sx={{ position: 'relative', height: 170, mt: 1.5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
            >
              {donutData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} produits`, name]}
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'primary.main', lineHeight: 1 }}>
            {stabilite}%
          </Typography>
          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>stabilite</Typography>
        </Box>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip label={`Publies: ${totalPublished}`} size="small" sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.15), color: 'success.main' }} />
        <Chip label={`Masques: ${totalMasked}`} size="small" sx={{ bgcolor: (t) => alpha(t.palette.error.main, 0.15), color: 'error.main' }} />
        <Chip label={`Stabilite: ${stabilite}%`} size="small" sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.15), color: 'primary.main' }} />
      </Stack>
    </Paper>
  );
}

function PerformanceCard({
  addToCart,
  alertCount,
  avgAddToCartRate,
  avgCtr,
  conversions,
  topProduct,
  totalViews,
  weakProduct,
}: {
  addToCart: number;
  alertCount: number;
  avgAddToCartRate: number;
  avgCtr: number;
  conversions: number;
  topProduct: CatalogueEntry | null;
  totalViews: number;
  weakProduct: CatalogueEntry | null;
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.25, borderColor: 'divider', height: '100%' }}>
      <Typography variant="h6" fontWeight={800}>Performance Catalogue</Typography>
      <Stack spacing={1.3} sx={{ mt: 1.5 }}>
        <MetricRow label="Vues totales" value={String(totalViews.toLocaleString('fr-DZ'))} />
        <MetricRow label="Taux de conversion moyen" value={formatPercent(avgCtr, 1)} accent="#2ea043" />
        <MetricRow label="Ajouts panier" value={`${Math.round(addToCart)} (${formatPercent(avgAddToCartRate, 1)})`} />
        <MetricRow label="Conversions (COD)" value={`${Math.round(conversions)} (${formatPercent(avgCtr, 1)})`} />
      </Stack>
      <Stack spacing={0.7} sx={{ mt: 1.5 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: 'success.main' }} />
          <Typography variant="body2">Top CTR: {topProduct?.nameFr || 'Aucun'} {'→'} {formatPercent(topProduct?.metrics.conversionRate ?? 0, 1)}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 18, color: 'error.main' }} />
          <Typography variant="body2">Moins performant: {weakProduct?.nameFr || 'Aucun'} {'→'} {formatPercent(weakProduct?.metrics.conversionRate ?? 0, 1)}</Typography>
        </Stack>
      </Stack>
      <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 3, bgcolor: 'rgba(210,153,34,0.15)', color: 'warning.main' }}>
        <Typography variant="body2">{alertCount} produits signales ({'≥'}30% retour) {'→'} revision recommandee</Typography>
      </Box>
    </Paper>
  );
}

function CoverageCard({
  bothChannels,
  hidden,
  total,
  waOnly,
  webOnly,
}: {
  bothChannels: number;
  hidden: number;
  total: number;
  waOnly: number;
  webOnly: number;
}) {
  const theme = useTheme();
  const segments = [
    { color: theme.palette.success.main, label: `Web + WhatsApp: ${bothChannels}`, value: bothChannels },
    { color: theme.palette.primary.main, label: `Web uniquement: ${webOnly}`, value: webOnly },
    { color: theme.palette.info.main,    label: `WA uniquement: ${waOnly}`, value: waOnly },
    { color: theme.palette.warning.main, label: `Non publies: ${hidden}`, value: hidden },
  ];
  const trackStroke = theme.palette.divider;
  const circumference = 2 * Math.PI * 42;
  let offset = 0;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.25, borderColor: 'divider', height: '100%' }}>
      <Typography variant="h6" fontWeight={800}>Couverture des Canaux</Typography>
      <Stack alignItems="center" sx={{ mt: 1.5 }}>
        <Box sx={{ position: 'relative', width: 180, height: 180 }}>
          <svg viewBox="0 0 120 120" width="180" height="180">
            <circle cx="60" cy="60" r="42" stroke={trackStroke} strokeWidth="18" fill="none" />
            {segments.map((segment) => {
              const fraction = total > 0 ? segment.value / total : 0;
              const stroke = circumference * fraction;
              const element = (
                <circle
                  key={segment.label}
                  cx="60"
                  cy="60"
                  r="42"
                  stroke={segment.color}
                  strokeWidth="18"
                  fill="none"
                  strokeDasharray={`${stroke} ${circumference - stroke}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 60 60)"
                />
              );
              offset += stroke;
              return element;
            })}
          </svg>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Typography variant="h4" fontWeight={800}>{total}</Typography>
            <Typography variant="body2" color="text.secondary">produits</Typography>
          </Box>
        </Box>
      </Stack>
      <Grid container spacing={1.2}>
        {segments.map((segment) => (
          <Grid item xs={6} key={segment.label}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: segment.color }} />
              <Typography variant="body2" color="text.secondary">{segment.label}</Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

function TopSearchesCard({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.25, borderColor: 'divider', height: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6" fontWeight={800}>Top Recherches (7j)</Typography>
        <Chip label="OpenSearch" size="small" sx={{ bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main' }} />
      </Stack>
      <Stack spacing={1.1} sx={{ mt: 1.75 }}>
        {items.map((item) => (
          <Stack key={item.label} direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ width: 112, color: 'text.secondary', textTransform: 'lowercase' }}>
              {item.label}
            </Typography>
            <Box sx={{ flex: 1, height: 18, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box sx={{ width: `${(item.value / max) * 100}%`, height: '100%', bgcolor: 'primary.main' }} />
            </Box>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Index OpenSearch interne - Algerie - Donnees temps reel
      </Typography>
    </Paper>
  );
}

function SearchGapCard({
  items,
  onCreateProduct,
  onOpenProduct,
}: {
  items: Array<{ action: string; id: string; label: string; volume: number }>;
  onCreateProduct: (query: string) => void;
  onOpenProduct: (id: string) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.25, borderColor: 'divider', height: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6" fontWeight={800}>Recherches Sans Resultat</Typography>
        <Chip label={`${items.length} lacunes`} size="small" sx={{ bgcolor: 'rgba(248,81,73,0.15)', color: 'error.main' }} />
      </Stack>
      <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 3, bgcolor: 'rgba(210,153,34,0.15)', color: 'warning.main' }}>
        <Typography variant="body2">Chaque lacune = commande potentielle manquee.</Typography>
      </Box>
      <Stack spacing={1.25} sx={{ mt: 1.5 }}>
        {items.map((item) => (
          <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Box>
              <Typography variant="body2">{item.label}</Typography>
              <Typography variant="caption" color="text.secondary">{item.volume}/sem</Typography>
            </Box>
            <Button size="small" variant="contained" sx={{ borderRadius: 999 }} onClick={() => item.action === 'Creer produit' ? onCreateProduct(item.label) : onOpenProduct(item.id)}>
              {item.action}
            </Button>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

function IndexAlertsCard({
  alerts,
  onOpenPim,
  onReindex,
  pending,
}: {
  alerts: Array<{ id: string; level: string; message: string; product: CatalogueEntry; since: string }>;
  onOpenPim: (productId: string) => void;
  onReindex: () => void;
  pending?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.25, borderColor: 'divider', height: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6" fontWeight={800}>Alertes Indexation</Typography>
        <Chip label={`${alerts.length} problemes`} size="small" sx={{ bgcolor: (t) => alpha(t.palette.error.main, 0.15), color: 'error.main', border: '1px solid', borderColor: 'error.main', fontWeight: 700 }} />
      </Stack>
      <Stack spacing={1.35} sx={{ mt: 1.5 }}>
        {alerts.map((alert) => (
          <Box key={alert.id}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Chip
                label={alert.level}
                size="small"
                sx={{
                  bgcolor: (t) => alpha(alert.level === 'Erreur' ? t.palette.error.main : t.palette.warning.main, 0.15),
                  color: alert.level === 'Erreur' ? 'error.main' : 'warning.main',
                  border: '1px solid',
                  borderColor: alert.level === 'Erreur' ? 'error.main' : 'warning.main',
                  fontWeight: 700,
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ color: alert.level === 'Erreur' ? 'error.main' : 'warning.main', fontWeight: 600 }}>
                  {alert.product.sku} - {alert.product.nameFr}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alert.message} - {alert.since}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }}>
                  <Button size="small" onClick={() => onOpenPim(alert.product.productId)}>Ouvrir PIM</Button>
                  <Button size="small" variant="contained" color="warning" onClick={onReindex} disabled={pending}>
                    {pending ? 'Reindex...' : 'Diagnostiquer'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Cluster OpenSearch interne - Algerie - Conforme Banque d&apos;Algerie
      </Typography>
    </Paper>
  );
}

function MetricRow({
  accent,
  label,
  value,
}: {
  accent?: string;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={800} sx={{ color: accent ?? 'text.primary' }}>
        {value}
      </Typography>
    </Stack>
  );
}
