'use client';

import React from 'react';
import {
  Paper,
  Typography,
  Skeleton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import TrendingUpIcon   from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon         from '@mui/icons-material/Info';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from 'recharts';

import { useRapportsVentes } from '@/modules/rapports/hooks/useRapportsVentes';
import { fmtDZD, fmtDZDShort, fmtNumber } from '@/modules/rapports/utils/formatters';
import { CATEGORICAL, MODULE_COLORS, getOrderStatusColor } from '@/modules/rapports/utils/chartColors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface VentesOMSTabProps {
  period: string;
}

interface VentesData {
  caByDay: { date: string; ca: number; count: number }[];
  statusDistribution: { status: string; count: number }[];
  operatorPerformance: { name: string; tauxConfirmation: number }[];
  teamAvgTauxConfirmation: number;
  carrierPerformance: { name: string; total: number; delivered: number; failed: number; tauxLivraison: number; delaiMoyen: number; wilayas: number }[];
  failureReasons: { raison: string; count: number; color: string }[];
  volumeByHour: { hour: string; count: number }[];
  montantDistribution: { label: string; count: number }[];
  panierMoyen: number;
}

/* ------------------------------------------------------------------ */
/*  Status labels in French                                            */
/* ------------------------------------------------------------------ */

const STATUS_LABELS: Record<string, string> = {
  delivered:  'Livrées',
  failed:     'Échec livraison',
  cancelled:  'Annulées — opérateur',
  transit:    'En cours',
  awaiting:   'Annulées — expire auto',
  returned:   'Retournées',
};

const STATUS_DONUT_COLORS = ['#22c55e', '#ef4444', '#f97316', '#3b82f6', '#6b7280', '#a855f7'];

// A. Operator performance: threshold-based coloring (instant interpretation)
function operatorColor(taux: number): string {
  if (taux >= 80) return '#16a34a'; // green — good
  if (taux >= 60) return '#d97706'; // orange — average
  return '#dc2626';                 // red — needs training
}

// C. Failure reasons: dark-red → light-red scale by frequency rank
const FAILURE_RED_SCALE = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'];
function failureColor(rank: number, total: number): string {
  const idx = Math.round((rank / Math.max(total - 1, 1)) * (FAILURE_RED_SCALE.length - 1));
  return FAILURE_RED_SCALE[idx];
}

// E. Montant distribution: light-blue → dark-blue scale by basket size rank
const BASKET_BLUE_SCALE = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'];
function basketColor(idx: number, total: number): string {
  const i = Math.round((idx / Math.max(total - 1, 1)) * (BASKET_BLUE_SCALE.length - 1));
  return BASKET_BLUE_SCALE[i];
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={5}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function VentesOMSTab({ period }: VentesOMSTabProps) {
  const { data: responseData, isLoading } = useRapportsVentes(period, true);
  const d = responseData?.data as VentesData | undefined;

  if (isLoading || !d) return <LoadingSkeleton />;

  const totalCA = d.caByDay.reduce((s, r) => s + r.ca, 0);
  const totalOrders = d.caByDay.reduce((s, r) => s + r.count, 0);
  const maxDay = d.caByDay.reduce((best, r) => (r.ca > best.ca ? r : best), d.caByDay[0]);
  const minDay = d.caByDay.reduce((best, r) => (r.ca < best.ca ? r : best), d.caByDay[0]);

  return (
    <Box>
      {/* Source label */}
      <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 500, display: 'block', mb: 2 }}>
        Source: Module OMS · Toutes données COD
      </Typography>

      {/* ── Row 1: CA Chart (7) + Statuts Donut (5) ────────────────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* CA et Volume Commandes */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              CA (DZD) et Volume Commandes — {period === '7d' ? '7j' : '30j'}
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={d.caByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tickFormatter={(v: number) => fmtDZDShort(v)} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number, name: string) => name === 'CA' ? fmtDZD(value) : value} />
                <Legend />
                <Bar yAxisId="left" dataKey="ca" name="CA" fill={CATEGORICAL[0]} barSize={16} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Commandes/jour" stroke={CATEGORICAL[2]} strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Summary stats */}
            <Box display="flex" gap={3} mt={2} flexWrap="wrap">
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary">{fmtDZD(totalCA)}</Typography>
                <Typography variant="caption" color="text.secondary">
                </Typography>
              </Box>
              {maxDay && (
                <Box>
                  <Typography variant="h6" fontWeight={700}>{fmtDZD(maxDay.ca)}</Typography>
                  <Typography variant="caption" color="text.secondary">Pic journalier ({maxDay.date})</Typography>
                </Box>
              )}
              {minDay && (
                <Box>
                  <Typography variant="h6" fontWeight={700}>{fmtDZD(minDay.ca)}</Typography>
                  <Typography variant="caption" color="text.secondary">Jour calme (Vendredi)</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Statuts Commandes */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Statuts Commandes — {fmtNumber(totalOrders)} total
            </Typography>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={d.statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={2}
                  label={({ status, percent }: { status: string; percent: number }) =>
                    `${STATUS_LABELS[status] ?? status}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ strokeWidth: 1 }}
                >
                  {d.statusDistribution.map((_, idx) => (
                    <Cell key={idx} fill={STATUS_DONUT_COLORS[idx % STATUS_DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, STATUS_LABELS[name] ?? name]} />
              </PieChart>
            </ResponsiveContainer>

            {/* Insight banner */}
            <Alert
              severity="info"
              icon={<TrendingUpIcon />}
              sx={{ mt: 1, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 12 } }}
            >
              Livrées +2.3 pts vs M-1 · Échecs -11 pts · Les annulations auto (expiré) représentent 19% — principale perte de revenu.
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 2: Operators (4) + Carriers (4) + Failures (4) ─────── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Taux Confirmation par Opérateur */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Taux Confirmation par Opérateur
              </Typography>
              <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
            </Box>

            <ResponsiveContainer width="100%" height={Math.max(220, d.operatorPerformance.length * 45)}>
              <BarChart data={d.operatorPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="tauxConfirmation" name="Taux" barSize={16}>
                  {d.operatorPerformance.map((op: any, idx: number) => (
                    <Cell key={idx} fill={operatorColor(op.tauxConfirmation)} />
                  ))}
                </Bar>
                <ReferenceLine
                  x={d.teamAvgTauxConfirmation}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: `Moy. ${d.teamAvgTauxConfirmation.toFixed(0)}%`, position: 'top', fill: '#ef4444', fontSize: 11 }}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Worst performer insight */}
            {d.operatorPerformance.length > 0 && (() => {
              const worst = [...d.operatorPerformance].sort((a, b) => a.tauxConfirmation - b.tauxConfirmation)[0];
              return (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {worst.name}: -{(d.teamAvgTauxConfirmation - worst.tauxConfirmation).toFixed(0)} pts sous la moyenne · Formation recommandée
                </Typography>
              );
            })()}
          </Paper>
        </Grid>

        {/* Taux Livraison par Carrier */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Taux Livraison par Carrier
              </Typography>
              <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Carrier</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">%</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">Délai</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">Wilayas</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: 12 }} align="right">Échecs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.carrierPerformance.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{row.name}</TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                          <Typography variant="body2" fontWeight={600}>{(row.tauxLivraison ?? 0).toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{row.delaiMoyen != null ? `${row.delaiMoyen.toFixed(1)}j` : '—'}</TableCell>
                      <TableCell align="right">{row.wilayas}/48</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={row.failed > 3 ? 'error' : 'text.primary'}>
                          {row.failed} lit.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Worst carrier insight */}
            {d.carrierPerformance.length > 0 && (() => {
              const worst = [...d.carrierPerformance].sort((a, b) => a.tauxLivraison - b.tauxLivraison)[0];
              return (
                <Alert
                  severity="warning"
                  icon={<WarningAmberIcon />}
                  sx={{ mt: 1.5, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}
                >
                  {worst.name}: taux livraison {(worst.tauxLivraison ?? 0).toFixed(0)}% (seuil: 70%). Réduire attribution {worst.name}, augmenter Maystro.
                </Alert>
              );
            })()}
          </Paper>
        </Grid>

        {/* Pourquoi les commandes échouent */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Pourquoi les commandes échouent
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
                <Chip label="CRM" size="small" sx={{ bgcolor: MODULE_COLORS.CRM.bg, color: MODULE_COLORS.CRM.text, fontWeight: 600 }} />
              </Box>
            </Box>

            <ResponsiveContainer width="100%" height={Math.max(220, d.failureReasons.length * 38)}>
              <BarChart
                data={[...d.failureReasons].sort((a, b) => b.count - a.count)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="raison" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Nombre">
                  {[...d.failureReasons]
                    .sort((a, b) => b.count - a.count)
                    .map((_: any, idx: number) => (
                      <Cell key={idx} fill={failureColor(idx, d.failureReasons.length)} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Box display="flex" gap={1} mt={0.5} alignItems="center">
              <Box sx={{ width: 40, height: 6, borderRadius: 1, background: 'linear-gradient(to right, #7f1d1d, #fca5a5)' }} />
              <Typography variant="caption" color="text.secondary">Fréquence: critique → mineur</Typography>
            </Box>

            {/* Insight */}
            <Alert
              severity="error"
              icon={<InfoIcon />}
              sx={{ mt: 1.5, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}
            >
              237 annulations par expiration = opportunité revenus perdue. Réduction délai confirmation (objectif {'<'} 30 min) = impact direct CA.
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Volume par Heure (6) + Distribution Montants (6) ── */}
      <Grid container spacing={3}>
        {/* Volume Commandes par Heure */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Volume Commandes par Heure (7j)
            </Typography>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={d.volumeByHour}>
                <defs>
                  <linearGradient id="gradientVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={(h) => `${h}h`} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(h) => `${h}h00`} />
                {/* Peak zone 1: 10h–12h */}
                <ReferenceArea x1={10} x2={12} fill="#dcfce7" fillOpacity={0.5} />
                {/* Peak zone 2: 20h–22h */}
                <ReferenceArea x1={20} x2={22} fill="#dcfce7" fillOpacity={0.5} />
                {/* Trough: 14h–16h */}
                <ReferenceArea x1={14} x2={16} fill="#f3f4f6" fillOpacity={0.7} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Commandes"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#gradientVol)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563eb' }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Peak labels */}
            <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
              <Chip label="Pic 1: 10h–12h" size="small" color="primary" variant="outlined" icon={<TrendingUpIcon />} />
              <Chip label="Pic 2: 20h–22h" size="small" color="primary" variant="outlined" icon={<TrendingUpIcon />} />
              <Chip label="Creux: 14h–16h" size="small" color="default" variant="outlined" icon={<TrendingDownIcon />} />
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#ea580c' }}>
              Pic 1: Ouverture sessions · Pic 2: Après-dîner · Creux: Sieste Algérie
            </Typography>
            <Typography variant="caption" sx={{ color: '#ea580c' }}>
              Staffing OMS optimal: +2 opérateurs 10h–12h et 20h–22h
            </Typography>
          </Paper>
        </Grid>

        {/* Distribution Montants Commandes */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Distribution Montants Commandes (30j)
            </Typography>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.montantDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Commandes" barSize={28} radius={[4, 4, 0, 0]}>
                  {d.montantDistribution.map((_: any, idx: number) => (
                    <Cell key={idx} fill={basketColor(idx, d.montantDistribution.length)} />
                  ))}
                </Bar>
                <ReferenceLine
                  y={0}
                  stroke="transparent"
                  label={{
                    value: `Panier moyen: ${fmtDZD(d.panierMoyen)}`,
                    position: 'insideTopRight',
                    fill: '#ef4444',
                    fontSize: 12,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>

            <Box display="flex" gap={1} mt={1} alignItems="center">
              <Box sx={{ width: 60, height: 6, borderRadius: 1, background: 'linear-gradient(to right, #dbeafe, #1e3a8a)' }} />
              <Typography variant="caption" color="text.secondary">Valeur panier: faible → élevé</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Panier moyen: {fmtDZD(d.panierMoyen)} · Objectif: 12 000 DZD
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
