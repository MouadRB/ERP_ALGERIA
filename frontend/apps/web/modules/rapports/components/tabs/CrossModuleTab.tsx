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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import { useRapportsCrossModule } from '@/modules/rapports/hooks/useRapportsCrossModule';
import { fmtDZD, fmtDZDShort, fmtNumber } from '@/modules/rapports/utils/formatters';
import { CATEGORICAL, MODULE_COLORS } from '@/modules/rapports/utils/chartColors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CrossModuleTabProps { period: string; }

interface CrossModuleData {
  ordersToStock: { totalOrders: number; stockValue: number; alertes: number; maskedProducts: number };
  clientRetention: { totalCustomers: number; activeCount: number; vipCount: number; avgCA: number; tauxLivraison: number };
  supplyChain: { bcPending: number; stockAlerts: number; maskedFromCatalogue: number; avgSupplierOnTime: number };
  channelMix: {
    omsSource: { source: string; count: number }[];
    crmChannel: { channel: string; count: number }[];
    catalogueChannels: { channel: string; commandes: number; tauxLivraison: number; panierMoyen: number }[];
  };
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
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={6}><Skeleton variant="rounded" height={350} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function CrossModuleTab({ period }: CrossModuleTabProps) {
  const { data, isLoading } = useRapportsCrossModule(period, true);
  const d = data?.data as CrossModuleData | undefined;

  if (isLoading || !d) return <LoadingSkeleton />;

  const ots = d.ordersToStock;
  const cr = d.clientRetention;
  const sc = d.supplyChain;
  const cm = d.channelMix;

  const clientPieData = [
    { name: 'Actifs', value: cr.activeCount },
    { name: 'Inactifs', value: cr.totalCustomers - cr.activeCount },
  ];

  const supplyBarData = [
    { label: 'BC en attente',    value: sc.bcPending,             color: '#f59e0b' },
    { label: 'Alertes stock',    value: sc.stockAlerts,           color: '#ef4444' },
    { label: 'Produits masqués', value: sc.maskedFromCatalogue,   color: '#6366f1' },
    { label: 'On-Time %',        value: sc.avgSupplierOnTime,     color: '#22c55e' },
  ];

  return (
    <Box>
      {/* ── Row 1: Commandes <-> Stock (6) + Rétention Client (6) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Commandes <-> Stock */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Commandes &harr; Stock
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
                <Chip label="Inventaire" size="small" sx={{ bgcolor: MODULE_COLORS.Inventaire.bg, color: MODULE_COLORS.Inventaire.text, fontWeight: 600 }} />
              </Box>
            </Box>

            <Grid container spacing={2}>
              {[
                { label: 'Commandes', value: fmtNumber(ots.totalOrders), color: CATEGORICAL[0] },
                { label: 'Valeur Stock', value: fmtDZDShort(ots.stockValue), color: CATEGORICAL[1] },
                { label: 'Alertes Réappro', value: String(ots.alertes), color: ots.alertes > 5 ? '#ef4444' : '#f59e0b' },
                { label: 'Produits Masqués', value: String(ots.maskedProducts), color: ots.maskedProducts > 10 ? '#ef4444' : '#f59e0b' },
              ].map((stat) => (
                <Grid item xs={6} key={stat.label}>
                  <Box sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {fmtNumber(ots.totalOrders)} commandes traitées avec {fmtDZDShort(ots.stockValue)} en stock — {ots.alertes} alertes réappro, {ots.maskedProducts} produits masqués
            </Typography>
          </Paper>
        </Grid>

        {/* Rétention Client */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Rétention Client
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="CRM" size="small" sx={{ bgcolor: MODULE_COLORS.CRM.bg, color: MODULE_COLORS.CRM.text, fontWeight: 600 }} />
                <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
              </Box>
            </Box>

            <Box display="flex" gap={3} flexWrap="wrap" alignItems="center">
              {/* Metrics list */}
              <Box flex="1 1 240px">
                {[
                  { label: 'Total Clients', value: fmtNumber(cr.totalCustomers) },
                  { label: 'Clients Actifs', value: fmtNumber(cr.activeCount), chip: true, color: 'success' as const },
                  { label: 'Clients VIP', value: fmtNumber(cr.vipCount), chip: true, color: 'primary' as const },
                  { label: 'CA Moyen / Client', value: fmtDZD(cr.avgCA) },
                ].map((m) => (
                  <Box key={m.label} display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
                    <Typography variant="body2">{m.label}</Typography>
                    {m.chip ? (
                      <Chip label={m.value} size="small" color={m.color} />
                    ) : (
                      <Typography variant="body2" fontWeight={700}>{m.value}</Typography>
                    )}
                  </Box>
                ))}

                <Box sx={{ mt: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Taux Livraison</Typography>
                    <Typography variant="body2" fontWeight={700}>{cr.tauxLivraison.toFixed(1)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={cr.tauxLivraison}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={cr.tauxLivraison >= 70 ? 'success' : 'warning'}
                  />
                </Box>
              </Box>

              {/* Donut */}
              <Box flex="1 1 240px" minHeight={220}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={clientPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                      <Cell fill={CATEGORICAL[1]} />
                      <Cell fill="#d1d5db" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 2: Supply Chain Flow (6) + Mix Canaux (6) ── */}
      <Grid container spacing={3}>
        {/* Supply Chain Flow */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Supply Chain Flow
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="Appro." size="small" sx={{ bgcolor: MODULE_COLORS.Approvisionnement.bg, color: MODULE_COLORS.Approvisionnement.text, fontWeight: 600 }} />
                <Chip label="Inventaire" size="small" sx={{ bgcolor: MODULE_COLORS.Inventaire.bg, color: MODULE_COLORS.Inventaire.text, fontWeight: 600 }} />
              </Box>
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              <Chip label={`BC en attente: ${sc.bcPending}`} color="warning" variant="outlined" size="small" />
              <Chip label={`Alertes stock: ${sc.stockAlerts}`} color={sc.stockAlerts > 5 ? 'error' : 'warning'} variant="outlined" size="small" />
              <Chip label={`Produits masqués: ${sc.maskedFromCatalogue}`} color="info" variant="outlined" size="small" />
              <Chip label={`On-Time: ${sc.avgSupplierOnTime}%`} color={sc.avgSupplierOnTime >= 80 ? 'success' : 'warning'} variant="outlined" size="small" />
            </Box>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={supplyBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Count" barSize={18}>
                  {supplyBarData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Mix Canaux — CLARIFIED */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Analyse Canaux
              </Typography>
              <Chip label="Multi-module" size="small" sx={{ bgcolor: MODULE_COLORS['Multi-module'].bg, color: MODULE_COLORS['Multi-module'].text, fontWeight: 600 }} />
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              {/* Source de commande (OMS) */}
              <Box flex="1 1 200px">
                <Typography variant="subtitle2" gutterBottom textAlign="center">
                  Source de commande
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={cm.omsSource} dataKey="count" nameKey="source" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}
                      label={({ source, percent }: any) => `${source}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {cm.omsSource.map((_, idx) => <Cell key={idx} fill={CATEGORICAL[idx]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Canal d'acquisition (CRM) */}
              <Box flex="1 1 200px">
                <Typography variant="subtitle2" gutterBottom textAlign="center">
                  Canal d&apos;acquisition client
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={cm.crmChannel} dataKey="count" nameKey="channel" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}
                      label={({ channel, percent }: any) => `${channel}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {cm.crmChannel.map((_, idx) => <Cell key={idx} fill={CATEGORICAL[idx + 3]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Performance par canal table */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Performance par Canal
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: 12 }}>Canal</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>Commandes</TableCell>
                    <TableCell sx={{ minWidth: 140, fontSize: 12 }}>Taux Livraison</TableCell>
                    <TableCell align="right" sx={{ fontSize: 12 }}>Panier Moyen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cm.catalogueChannels.map((row) => (
                    <TableRow key={row.channel}>
                      <TableCell sx={{ fontWeight: 500 }}>{row.channel}</TableCell>
                      <TableCell align="right">{row.commandes}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress variant="determinate" value={row.tauxLivraison} sx={{ flex: 1, height: 6, borderRadius: 3 }} color={row.tauxLivraison >= 70 ? 'success' : 'warning'} />
                          <Typography variant="caption" sx={{ minWidth: 36 }}>{row.tauxLivraison.toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{fmtDZDShort(row.panierMoyen)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Alert severity="success" sx={{ mt: 2, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
              WhatsApp: taux livraison supérieur (+4 pts) car clients plus engagés.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
