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
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import { useRapportsInventaire } from '@/modules/rapports/hooks/useRapportsInventaire';
import { fmtDZD, fmtDZDShort, fmtNumber } from '@/modules/rapports/utils/formatters';
import { CATEGORICAL, MODULE_COLORS } from '@/modules/rapports/utils/chartColors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InventaireStockTabProps { period: string; }

interface InventaireData {
  valorisationFIFO: { total: number; byWarehouse: { code: string; name: string; value: number; pct: number }[] };
  alertesReappro: { sku: string; nameFr: string; stock: number; seuil: number; urgency: string }[];
  totalAlertes: number;
  typesMouvements: { total: number; reception: number; sortie: number; retour: number; transfert: number };
  reservationsActives: { total: number; soft: number; hard: number; quarantaine: number };
  couchesFIFO: { month: string; electronique: number; mode: number; sport: number; autre: number }[];
  transfertsInterEntrepot: { from: string; to: string; count: number }[];
  stockQuarantaine: { sku: string; nameFr: string; qty: number; reason: string; inspection: string }[];
  totalQuarantaine: number;
  rotationStock: { category: string; rotation: number }[];
  topReserved?: { sku: string; nameFr: string; reserved: number; type: 'soft' | 'hard' }[];
}

const URGENCY_COLOR: Record<string, 'error' | 'warning' | 'info'> = { critique: 'error', haute: 'warning', moyenne: 'info' };


/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[1, 2, 3].map(n => (
          <Grid item xs={12} md={4} key={n}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
        ))}
      </Grid>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={8}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function InventaireStockTab({ period }: InventaireStockTabProps) {
  const { data, isLoading } = useRapportsInventaire(period, true);
  const d = data?.data as InventaireData | undefined;

  if (isLoading || !d) return <LoadingSkeleton />;

  const mouvementsData = [
    { name: 'Réception', value: d.typesMouvements.reception, color: CATEGORICAL[1] },
    { name: 'Sortie', value: d.typesMouvements.sortie, color: CATEGORICAL[0] },
    { name: 'Retour', value: d.typesMouvements.retour, color: CATEGORICAL[2] },
    { name: 'Transfert', value: d.typesMouvements.transfert, color: CATEGORICAL[5] },
  ];

  return (
    <Box>
      {/* Source */}
      <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 500, display: 'block', mb: 2 }}>
        Sources: Module Inventaire · FIFO · Temps réel
      </Typography>

      {/* ── Row 1: Valorisation FIFO (4) + Alertes Réappro (4) + Mouvements (4) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Valorisation FIFO */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Valorisation Stock FIFO (temps réel)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🔒 Finance + Inventory Manager
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center', pt: 1, pb: 2 }}>
              <Typography variant="h3" fontWeight={700} color="primary">
                {fmtDZDShort(d.valorisationFIFO.total)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {d.valorisationFIFO.byWarehouse?.[0]?.name ?? 'Entrepôt Central'}
              </Typography>
            </Box>

            <Grid container spacing={1}>
              {[
                { label: 'Mvt. net (30j)', value: `+${d.typesMouvements.reception - d.typesMouvements.sortie}`, color: '#16a34a' },
                { label: 'Réservations', value: fmtNumber(d.reservationsActives.total), color: '#2563eb' },
                { label: 'Alertes réappro', value: String(d.totalAlertes), color: d.totalAlertes > 5 ? '#dc2626' : '#d97706' },
              ].map((s) => (
                <Grid item xs={4} key={s.label}>
                  <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>{s.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {d.topReserved && d.topReserved.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.75 }}>
                  Top 5 produits réservés
                </Typography>
                {d.topReserved.slice(0, 5).map((item, idx) => (
                  <Box key={item.sku} display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.75, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, minWidth: 18 }}>#{idx + 1}</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: 12, lineHeight: 1.3 }}>{item.nameFr}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>{item.sku}</Typography>
                      </Box>
                    </Box>
                    <Chip label={`${item.reserved} rés.`} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563eb', fontWeight: 600, fontSize: 11 }} />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Alertes Réapprovisionnement */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Alertes Réapprovisionnement — {d.totalAlertes} actives
              </Typography>
              <Chip label="Inventaire" size="small" sx={{ bgcolor: MODULE_COLORS.Inventaire.bg, color: MODULE_COLORS.Inventaire.text, fontWeight: 600 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 12 }}>Produit</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>Stock</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>Urgence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.alertesReappro.map((row) => (
                    <TableRow key={row.sku}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{row.nameFr}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>{row.sku}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color={row.stock <= 0 ? 'error' : 'text.primary'} fontWeight={600}>
                          {row.stock}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={row.urgency} size="small" color={URGENCY_COLOR[row.urgency] ?? 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#64748B' }}>
              {d.alertesReappro.filter(a => a.stock <= 0).length} rupture totale · {d.alertesReappro.filter(a => a.stock < 0).length} stock négatif (anomalie détectée). Correction dans Inventaire requise.
            </Typography>
          </Paper>
        </Grid>

        {/* Types de mouvements */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Types de mouvements (30j)
              </Typography>
              <Chip label={`${fmtNumber(d.typesMouvements.total)} mvt.`} size="small" color="primary" variant="outlined" />
            </Box>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={mouvementsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                >
                  {mouvementsData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#64748B' }}>
              Solde net: +{d.typesMouvements.reception - d.typesMouvements.sortie} unités (sorties + entrées). Retours en cours (BCs sortis).
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {d.totalQuarantaine} retours en quarantaine · Inspection requise · Impact valorisation FIFO
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 2: Réservations (4) + Couches FIFO (8) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Réservations actives (temps réel)
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="Inventaire" size="small" sx={{ bgcolor: MODULE_COLORS.Inventaire.bg, color: MODULE_COLORS.Inventaire.text, fontWeight: 600 }} />
                <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
              </Box>
            </Box>

            {/* 4 stat cards */}
            <Grid container spacing={1.5}>
              {[
                { label: 'Réservées', value: d.reservationsActives.total, color: '#22c55e' },
                { label: 'Soft (Délais)', value: d.reservationsActives.soft, color: '#f59e0b' },
                { label: 'Hard (OMS)', value: d.reservationsActives.hard, color: '#3b82f6' },
                { label: 'Quarantaine', value: d.reservationsActives.quarantaine, color: '#ef4444' },
              ].map((stat) => (
                <Grid item xs={6} key={stat.label}>
                  <Box sx={{ p: 1.5, bgcolor: `${stat.color}10`, borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Alert severity="info" sx={{ mt: 2, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
              {d.reservationsActives.soft} réservations Soft en cours · 7 expirent dans {'<'} 20 min (heures ouvrables: Dim-Jeu 8h-18h, Ven 8h-12h, Algérie). Expiration → stock libéré + commande annulée automatiquement.
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Couches FIFO actives — Évolution coût
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🔒 Finance + Inventory Manager
              </Typography>
            </Box>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={d.couchesFIFO}>
                <defs>
                  {[
                    { id: 'gElec', color: CATEGORICAL[0] },
                    { id: 'gMode', color: CATEGORICAL[2] },
                    { id: 'gSport', color: CATEGORICAL[1] },
                    { id: 'gAutre', color: CATEGORICAL[3] },
                  ].map((g) => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={g.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="electronique" name="Électronique" stackId="1" stroke={CATEGORICAL[0]} fill={`url(#gElec)`} />
                <Area type="monotone" dataKey="mode" name="Mode" stackId="1" stroke={CATEGORICAL[2]} fill={`url(#gMode)`} />
                <Area type="monotone" dataKey="sport" name="Sport" stackId="1" stroke={CATEGORICAL[1]} fill={`url(#gSport)`} />
                <Area type="monotone" dataKey="autre" name="Autre" stackId="1" stroke={CATEGORICAL[3]} fill={`url(#gAutre)`} />
              </AreaChart>
            </ResponsiveContainer>

            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Électronique: coût FIFO stable (+0.2% vs M-1). Inflation import maîtrisée.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Quarantaine (6) + Rotation (6) ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Stock en quarantaine (temps réel)
            </Typography>

            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
              {d.totalQuarantaine} unités · {d.stockQuarantaine.length} SKUs · Inspection requise
            </Typography>

            {d.stockQuarantaine.map((q) => (
              <Box key={q.sku} display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{q.nameFr}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{q.sku}</Typography>
                </Box>
                <Chip
                  label={q.inspection}
                  size="small"
                  sx={
                    q.inspection.toLowerCase().includes('inspect')
                      ? { bgcolor: '#D1FAE5', color: '#047857', fontWeight: 500 }
                      : { bgcolor: '#FFEDD5', color: '#C2410C', fontWeight: 500 }
                  }
                />
              </Box>
            ))}

            <Alert
              severity="warning"
              sx={{
                mt: 1.5,
                borderRadius: 1.5,
                bgcolor: '#FFF7ED',
                '& .MuiAlert-icon': { color: '#C2410C' },
                '& .MuiAlert-message': { fontSize: 11, color: '#C2410C' },
              }}
            >
              Valeur quarantaine: {fmtDZDShort(492000)} (FIFO)
            </Alert>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              Aucun coût quarantaine ne compte dans le stock disponible.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Rotation stock par catégorie
            </Typography>

            {(() => {
              const maxRotation = Math.max(...d.rotationStock.map(r => r.rotation), 1);
              return d.rotationStock.map((row) => (
                <Box key={row.category} sx={{ mb: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: 13 }}>{row.category}</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#1E293B' }}>{row.rotation}x</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(row.rotation / maxRotation) * 100}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#475569', borderRadius: 4 } }}
                  />
                </Box>
              ));
            })()}

            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#64748B' }}>
              Stocks lents à peu rapides (2-5x). Commander pour réassortiment.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
