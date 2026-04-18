'use client';

import React, { useState } from 'react';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import { useRapportsAppro } from '@/modules/rapports/hooks/useRapportsAppro';
import { fmtDZD, fmtNumber } from '@/modules/rapports/utils/formatters';
import { CATEGORICAL, MODULE_COLORS } from '@/modules/rapports/utils/chartColors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ApprovisionnementTabProps { period: string; }

interface ApproData {
  bcPipeline: { total: number; brouillon: number; enAttente: number; approuve: number; enCours: number; recu: number; totalValue: number };
  pendingApprovals: { id: string; supplier: string; value: number; items: number; daysWaiting: number; priority: string }[];
  supplierPerformance: { name: string; bcCount: number; onTime: number; tauxOnTime: number; delaiMoyen: number; qualityScore: number }[];
  receptionRecente: { bcId: string; supplier: string; receivedAt: string; items: number; conformity: number }[];
  alerts: { type: string; message: string; severity: string }[];
}

/* ------------------------------------------------------------------ */
/*  Pipeline color constants — semantic mapping                        */
/* ------------------------------------------------------------------ */

const PIPELINE_COLORS: Record<string, string> = {
  brouillon:  '#8b949e', // Gray    — neutral draft
  enAttente:  '#d29922', // Amber-500  — pause/warning, needs human intervention
  approuve:   '#58a6ff', // Blue-500   — confirmed/approved
  enCours:    '#a371f7', // Indigo-500 — active process (not as loud as orange, not as final as gray)
  recu:       CATEGORICAL[1], // Green — completed delivery
};

const PIPELINE_LABELS: Record<string, string> = {
  brouillon: 'Brouillon', enAttente: 'En Attente', approuve: 'Approuvé', enCours: 'En Cours', recu: 'Reçu',
};

const ALERT_TYPE_LABELS: Record<string, string> = { retard: 'Retard', budget: 'Budget', qualite: 'Qualité' };
const ALERT_TYPE_COLORS: Record<string, 'error' | 'info' | 'warning'> = { retard: 'error', budget: 'info', qualite: 'warning' };

/* ------------------------------------------------------------------ */
/*  Supplier Performance helpers                                       */
/* ------------------------------------------------------------------ */

function getSupplierStatut(taux: number): { label: string; color: string } {
  if (taux > 80) return { label: 'Excellent', color: 'success.main' }; // Emerald
  if (taux >= 60) return { label: 'Moyen',    color: 'warning.main' }; // Amber
  return              { label: 'Critique',   color: 'error.main' }; // Red
}

/* ------------------------------------------------------------------ */
/*  SupplierPerformanceTable                                           */
/* ------------------------------------------------------------------ */

function SupplierPerformanceTable({ rows }: { rows: ApproData['supplierPerformance'] }) {
  const [search, setSearch] = useState('');
  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <TextField
        size="small"
        placeholder="Rechercher fournisseur…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5, width: 280, '& .MuiInputBase-root': { fontSize: 12 } }}
      />

      <TableContainer sx={{ maxHeight: 320, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1 }}>Nom Fournisseur</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1, minWidth: 180 }}>Taux de Performance</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1 }}>Statut</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12, py: 1 }}>Volume Commandes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ fontSize: 12, color: 'text.secondary', py: 2 }}>
                  Aucun fournisseur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(row => {
                const statut = getSupplierStatut(row.tauxOnTime);
                return (
                  <TableRow key={row.name} hover>
                    <TableCell sx={{ fontSize: 12, py: 0.75, fontWeight: 500 }}>{row.name}</TableCell>

                    {/* Mini inline progress bar — visual without chart clutter */}
                    <TableCell sx={{ py: 0.75 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover', position: 'relative', overflow: 'hidden' }}>
                          <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(row.tauxOnTime, 100)}%`, bgcolor: statut.color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right', fontWeight: 700, color: statut.color, fontSize: 11 }}>
                          {row.tauxOnTime.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Conditional status badge */}
                    <TableCell sx={{ py: 0.75 }}>
                      <Chip
                        label={statut.label}
                        size="small"
                        sx={{
                          bgcolor: statut.color + '18',
                          color: statut.color,
                          border: `1px solid ${statut.color}44`,
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right" sx={{ fontSize: 12, py: 0.75, fontWeight: 600 }}>
                      {fmtNumber(row.bcCount)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
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
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: 2, mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function ApprovisionnementTab({ period }: ApprovisionnementTabProps) {
  const { data, isLoading } = useRapportsAppro(period, true);
  const d = data?.data as ApproData | undefined;

  if (isLoading || !d) return <LoadingSkeleton />;

  const pipelineStages = (['brouillon', 'enAttente', 'approuve', 'enCours', 'recu'] as const).map((key) => ({
    stage: PIPELINE_LABELS[key],
    count: (d.bcPipeline as any)[key] as number,
    fill: PIPELINE_COLORS[key],
  }));

  return (
    <Box>
      {/* ── Row 1: Pipeline BC (6) + Approbations en Attente (6) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* ── Pipeline BC — semantic color bar chart ── */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Pipeline BC (Bons de Commande)
              </Typography>
              <Chip
                label="Appro."
                size="small"
                sx={{ bgcolor: MODULE_COLORS.Approvisionnement.bg, color: MODULE_COLORS.Approvisionnement.text, fontWeight: 600 }}
              />
            </Box>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipelineStages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="BC" barSize={20}>
                  {pipelineStages.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Footer badges — aligned, professional slate text */}
            <Box display="flex" gap={1.5} mt={1.5} alignItems="center">
              <Chip
                label={`Total: ${fmtNumber(d.bcPipeline.total)} BC`}
                variant="outlined"
                size="small"
                sx={{ color: 'text.secondary', borderColor: 'divider', fontWeight: 600, fontSize: 12 }}
              />
              <Chip
                label={`Valeur: ${fmtDZD(d.bcPipeline.totalValue)}`}
                variant="outlined"
                size="small"
                sx={{ color: 'text.secondary', borderColor: 'divider', fontWeight: 600, fontSize: 12 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* ── Approbations en Attente ── */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Approbations en Attente
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Fournisseur</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>Valeur</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>Jours</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Priorité</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.pendingApprovals.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontSize: 12 }}>{row.id}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.supplier}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>{fmtDZD(row.value)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>{row.daysWaiting}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.priority === 'haute' ? 'Haute' : 'Normale'}
                          color={row.priority === 'haute' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 2: Performance Fournisseurs — Searchable Table (full width) ── */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Performance Fournisseurs
        </Typography>

        <SupplierPerformanceTable rows={d.supplierPerformance} />
      </Paper>

      {/* ── Row 3: Réceptions Récentes (6) + Alertes (6) ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Réceptions Récentes
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>BC</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Fournisseur</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600 }}>Articles</TableCell>
                    <TableCell sx={{ minWidth: 140, fontSize: 12, fontWeight: 600 }}>Conformité</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.receptionRecente.map((row) => (
                    <TableRow key={row.bcId} hover>
                      <TableCell sx={{ fontSize: 12 }}>{row.bcId}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.supplier}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{row.receivedAt}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>{row.items}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={row.conformity}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            color={row.conformity >= 90 ? 'success' : row.conformity >= 70 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" sx={{ minWidth: 30 }}>{row.conformity.toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Alertes
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {d.alerts.map((alert, idx) => (
                <Alert
                  key={idx}
                  severity={alert.severity === 'haute' ? 'error' : 'warning'}
                  sx={{ borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 13 } }}
                  action={
                    <Box display="flex" gap={0.5}>
                      <Chip
                        label={ALERT_TYPE_LABELS[alert.type] ?? alert.type}
                        color={ALERT_TYPE_COLORS[alert.type] ?? 'default'}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={alert.severity === 'haute' ? 'Haute' : 'Moyenne'}
                        color={alert.severity === 'haute' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Box>
                  }
                >
                  {alert.message}
                </Alert>
              ))}
              {d.alerts.length === 0 && (
                <Alert severity="success" sx={{ borderRadius: 1.5 }}>Aucune alerte active.</Alert>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
