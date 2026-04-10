'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Grid,
  Alert,
  LinearProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import SearchIcon from '@mui/icons-material/Search';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { useRapportsClients } from '@/modules/rapports/hooks/useRapportsClients';
import { fmtDZD, fmtNumber } from '@/modules/rapports/utils/formatters';
import { CATEGORICAL } from '@/modules/rapports/utils/chartColors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ClientsCRMTabProps { period: string; }

/* ------------------------------------------------------------------ */
/*  Color Palettes                                                     */
/* ------------------------------------------------------------------ */

// High-Contrast Semantic Palette — each segment has a unique, meaningful color
const SEGMENT_COLORS: Record<string, string> = {
  VIP:              '#F59E0B', // Amber-500  — gold/priority
  'Fidèle':         '#10B981', // Emerald-500 — healthy/active
  'Fidèle (30j)':   '#10B981', // alias for API variants
  'À risque':       '#F97316', // Orange-500 — caution
  Nouveau:          '#3B82F6', // Blue-500   — growth
  'Liste noire':    '#334155', // Slate-700  — restricted/inactive
  'Inactif (>60j)': '#94A3B8', // Slate-400  — neutral inactive
};

// Diverging Categorical Palette for Canal d'acquisition
const CHANNEL_COLORS = [
  '#14B8A6', // Teal-500
  '#6366F1', // Indigo-500
  '#F43F5E', // Rose-500
  '#F59E0B', // Amber-500
  '#8B5CF6', // Violet-500
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function periodLabel(period: string): string {
  if (period === '7d')  return '7 derniers jours';
  if (period === '30d') return '30 derniers jours';
  if (period === '90d') return '3 derniers mois';
  if (period === '12m') return '12 derniers mois';
  return period;
}

function acquisitionChipLabel(period: string, count: number): string {
  if (period === '7d')  return `${count} cette semaine`;
  if (period === '90d') return `${count} sur 3 mois`;
  if (period === '12m') return `${count} cette année`;
  return `${count} ce mois`;
}

/* ------------------------------------------------------------------ */
/*  Canal d'acquisition — External Label with Leader Lines            */
/* ------------------------------------------------------------------ */

const RADIAN = Math.PI / 180;

function ChannelExternalLabel({ cx, cy, midAngle, outerRadius, percent, name }: any) {
  if (percent < 0.04) return null; // skip slivers that would collide
  const radius = (outerRadius as number) + 36;
  const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
  const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > (cx as number) ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 500 }}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/* ------------------------------------------------------------------ */
/*  Wilaya Searchable Table                                            */
/* ------------------------------------------------------------------ */

function WilayaTable({ rows }: { rows: { name: string; count: number }[] }) {
  const [search, setSearch] = useState('');
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <TextField
        size="small"
        placeholder="Rechercher wilaya…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5, width: '100%', '& .MuiInputBase-root': { fontSize: 12 } }}
      />

      <Box sx={{ maxHeight: 260, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 11, py: 0.75 }}>Wilaya</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: 11, py: 0.75 }}>Clients</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 11, py: 0.75, minWidth: 110 }}>% Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ fontSize: 11, color: 'text.secondary', py: 2 }}>
                  Aucune wilaya trouvée
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row, idx) => {
                const pct = (row.count / total) * 100;
                return (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontSize: 11, py: 0.5 }}>{row.name}</TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, py: 0.5, fontWeight: 600 }}>{row.count}</TableCell>
                    <TableCell sx={{ fontSize: 11, py: 0.5 }}>
                      <Box display="flex" alignItems="center" gap={0.75}>
                        {/* Slate-200 track with Blue fill */}
                        <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', position: 'relative', overflow: 'hidden' }}>
                          <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(pct, 100)}%`, bgcolor: '#3B82F6', borderRadius: 3 }} />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 34, textAlign: 'right', fontSize: 10 }}>
                          {pct.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[1, 2, 3].map(n => (
          <Grid item xs={12} md={4} key={n}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function ClientsCRMTab({ period }: ClientsCRMTabProps) {
  const { data, isLoading } = useRapportsClients(period, true);
  const d = data?.data as any;

  if (isLoading || !d) return <LoadingSkeleton />;

  return (
    // pb={6} = 48px bottom padding — prevents watermark overlap on Wilaya table & Acquisition donut
    <Box pb={6}>
      {/* Source */}
      <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 500, display: 'block', mb: 2 }}>
        Source: Module CRM · Synchronisé avec OMS
      </Typography>

      {/* ── Row 1: Segments (4) + Acquisition (4) + Risque (4) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* ── Segments Clients ── */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Segments Clients — {fmtNumber(d.totalCustomers)} total
            </Typography>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={d.segmentDistribution}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {d.segmentDistribution.map((entry: any) => (
                    <Cell key={entry.segment} fill={SEGMENT_COLORS[entry.segment] ?? '#90A4AE'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [fmtNumber(value), name]} />
              </PieChart>
            </ResponsiveContainer>

            {/* High-contrast legend chips — each color unique and semantically meaningful */}
            <Box display="flex" flexWrap="wrap" gap={0.75} mt={1}>
              {d.segmentDistribution.map((s: any) => {
                const color = SEGMENT_COLORS[s.segment] ?? '#90A4AE';
                return (
                  <Chip
                    key={s.segment}
                    label={`${s.segment}: ${fmtNumber(s.count)}`}
                    size="small"
                    sx={{
                      bgcolor: color + '18',
                      border: `1px solid ${color}55`,
                      color: color,
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                );
              })}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              +450 nouveaux ce mois · ~87 inactifs (déclenchement)
            </Typography>
          </Paper>
        </Grid>

        {/* ── Acquisition Clients — dynamic period ── */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Acquisition Clients
              </Typography>
              <Chip
                label={acquisitionChipLabel(period, d.newThisMonth)}
                color="primary"
                size="small"
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Tendance sur {periodLabel(period)}
            </Typography>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.acquisitionByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Nouveaux clients"
                  fill={CATEGORICAL[1]}
                  radius={[3, 3, 0, 0]}
                  barSize={period === '90d' || period === '12m' ? 5 : 10}
                />
              </BarChart>
            </ResponsiveContainer>

            <Box display="flex" gap={2} mt={1}>
              <Box>
                <Typography variant="body2" fontWeight={700}>{d.acquisitionByDay?.[0]?.tauxRetention ?? '57%'}</Typography>
                <Typography variant="caption" color="text.secondary">Taux rétention</Typography>
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>{d.acquisitionByDay?.[0]?.churnRate ?? '3.2'}</Typography>
                <Typography variant="caption" color="text.secondary">Churn ({periodLabel(period)})</Typography>
              </Box>
            </Box>

            <Alert severity="success" sx={{ mt: 1.5, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
              Acquisition +480 ce mois (+14% vs M-1). Rétention 57% et en hausse de 2 pts. Objectif: 70%.
            </Alert>
          </Paper>
        </Grid>

        {/* ── Distribution Scores de Risque ── */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Distribution Scores de Risque
            </Typography>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={d.riskScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Clients" fill={CATEGORICAL[1]} radius={[3, 3, 0, 0]} barSize={16}>
                  {d.riskScoreDistribution?.map((_: any, idx: number) => (
                    <Cell key={idx} fill={idx >= 4 ? CATEGORICAL[2] : CATEGORICAL[1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <Typography variant="body2" color="text.secondary">
              Score moyen: {d.avgFraudScore?.toFixed(0) ?? '0'}/100 → Profil sain.
            </Typography>
            <Alert severity="info" sx={{ mt: 1, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
              90 clients en liste noire · +5 aujourd&apos;hui. Tentatives bloquées cette semaine: 7
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 2: Top 10 (6) + Support Performance (6) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Top 10 Clients — CA Cumulé
            </Typography>

            <ResponsiveContainer width="100%" height={Math.max(320, (d.topClientsByCA?.length ?? 0) * 36)}>
              <BarChart data={d.topClientsByCA} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v: number) => fmtDZD(v)} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="nameFr" width={95} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => fmtDZD(value)} />
                <Bar dataKey="totalSpentTTC" name="CA TTC" radius={[0, 4, 4, 0]} barSize={14}>
                  {d.topClientsByCA?.map((_: any, idx: number) => (
                    <Cell key={idx} fill={CATEGORICAL[idx % CATEGORICAL.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              CA top 10: {fmtDZD(d.topClientsByCA?.reduce((s: number, c: any) => s + c.totalSpentTTC, 0) ?? 0)} (12% du CA total)
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Support Client — Performance (30j)
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {[
                { label: 'Ouverts',      value: d.supportPerformance.openTickets,     color: '#f59e0b' },
                { label: 'Résolus (30j)', value: d.supportPerformance.resolvedTickets, color: '#22c55e' },
                { label: 'Escaladés',    value: d.supportPerformance.escalatedTickets, color: '#ef4444' },
              ].map((card) => (
                <Grid item xs={4} key={card.label}>
                  <Box sx={{ p: 1.5, bgcolor: `${card.color}10`, borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>{card.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="body2">Taux résolution ({d.supportPerformance.tauxResolution}%)</Typography>
              <LinearProgress
                variant="determinate"
                value={d.supportPerformance.tauxResolution}
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
                color={d.supportPerformance.tauxResolution >= 70 ? 'success' : 'warning'}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Délai moyen résolution: <strong>{d.supportPerformance.avgResolutionHours}h</strong> · {d.supportPerformance.totalTickets} total tickets (30j)
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Raisons tickets (top 4):</Typography>
            {d.supportPerformance.topCategories?.slice(0, 4).map((cat: any, i: number) => (
              <Typography key={i} variant="caption" color="text.secondary" display="block">
                {i + 1}. {cat?.category ?? cat} {cat?.count != null ? `(${cat.count})` : ''}
              </Typography>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Wilaya Table (4) + Canal Acquisition Donut (4) + Inactifs (4) ── */}
      <Grid container spacing={3}>

        {/* ── Répartition clients par wilaya — Searchable Table ── */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Répartition clients par wilaya
            </Typography>

            <WilayaTable rows={d.clientsByWilaya ?? []} />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              48 wilayas couvertes · 5 wilayas zéro client
            </Typography>
          </Paper>
        </Grid>

        {/* ── Canal d'acquisition — External Labels, Diverging Palette ── */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Canal d&apos;acquisition
            </Typography>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart margin={{ top: 24, right: 40, bottom: 24, left: 40 }}>
                <Pie
                  data={d.channelDistribution}
                  dataKey="count"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  label={ChannelExternalLabel}
                  labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                >
                  {d.channelDistribution?.map((_: any, idx: number) => (
                    <Cell key={idx} fill={CHANNEL_COLORS[idx % CHANNEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [fmtNumber(value), name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              WhatsApp: taux livraison supérieur (+4 pts)
            </Typography>
          </Paper>
        </Grid>

        {/* ── Inactifs > 90j — red urgency styling ── */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15, color: '#EF4444' }}>
                Inactifs &gt; 90j — Opportunité relance
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mb: 1.5, fontWeight: 500 }}>
              {d.inactiveClients?.length ?? 0} clients · Revenu potentiel:{' '}
              {fmtDZD(d.inactiveClients?.reduce((s: number, c: any) => s + (c.totalSpentTTC || 0), 0) ?? 0)}
            </Typography>

            {d.inactiveClients?.slice(0, 3).map((client: any, idx: number) => (
              <Box
                key={idx}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>{client.nameFr}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    il y a {client.daysSinceLastOrder ?? 90}j · {client.totalOrders ?? 0} cmd · {fmtDZD(client.totalSpentTTC)}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PhoneCallbackIcon sx={{ fontSize: 14 }} />}
                  sx={{ textTransform: 'none', fontSize: 11 }}
                >
                  Relancer WA
                </Button>
              </Box>
            ))}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
              Relance WhatsApp disponible depuis module CRM
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
