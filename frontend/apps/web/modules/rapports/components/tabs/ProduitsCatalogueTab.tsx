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
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Legend,
} from 'recharts';

import { useRapportsProduits } from '@/modules/rapports/hooks/useRapportsProduits';
import { fmtDZD, fmtDZDShort, fmtNumber } from '@/modules/rapports/utils/formatters';
import { CATEGORICAL, MODULE_COLORS } from '@/modules/rapports/utils/chartColors';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProduitsCatalogueTabProps {
  period: string;
}

interface ProduitsData {
  totalSKUs: number;
  publishedSKUs: number;
  draftSKUs: number;
  tauxPublication: number;
  publicationByCategory: { category: string; total: number; published: number; taux: number }[];
  maskedProducts: { sku: string; nameFr: string; reason: string; daysHidden: number }[];
  totalMasked: number;
  topProductsCAMarge: { sku: string; nameFr: string; ca: number; marge: number; qty: number }[];
  tauxRetourProduits: { sku: string; nameFr: string; tauxRetour: number; orders: number; returns: number }[];
  returnThreshold: number;
  channelPerformance: { channel: string; commandes: number; tauxLivraison: number; panierMoyen: number }[];
  openSearchHealth: { status: string; docsIndexed: number; totalDocs: number; indexRate: number; latencyMs: number; score: number; lastReindex: string };
  lacunesOpenSearch: { query: string; count: number; hasProduct: boolean }[];
  totalLacunes: number;
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={5}><Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} /></Grid>
        <Grid item xs={12} md={4}><Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} /></Grid>
      </Grid>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Donut categories colors                                            */
/* ------------------------------------------------------------------ */

const DONUT_COLORS = [CATEGORICAL[0], CATEGORICAL[1], CATEGORICAL[2], CATEGORICAL[5], CATEGORICAL[3], '#fd8c73'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Il y a moins d'1h";
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

function slateBarColor(idx: number): string {
  if (idx < 2) return '#c9d1d9';
  if (idx < 6) return '#8b949e';
  return '#8b949e';
}

function orangeBarColor(idx: number): string {
  if (idx < 2) return '#d29922';
  if (idx < 5) return '#fd8c73';
  return '#fd8c73';
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ProduitsCatalogueTab({ period }: ProduitsCatalogueTabProps) {
  const { data, isLoading } = useRapportsProduits(period, true);
  const d = data?.data as ProduitsData | undefined;

  if (isLoading || !d) return <LoadingSkeleton />;

  const avgTaux = d.publicationByCategory.length > 0
    ? d.publicationByCategory.reduce((s, r) => s + r.taux, 0) / d.publicationByCategory.length
    : 0;

  const topProducts = d.topProductsCAMarge.slice(0, 10);
  const osHealth = d.openSearchHealth;

  return (
    <Box>
      {/* Source label */}
      <Box display="flex" gap={1} mb={2}>
        <Chip label="PIM" size="small" sx={{ bgcolor: MODULE_COLORS.PIM.bg, color: MODULE_COLORS.PIM.text, fontWeight: 600 }} />
        <Chip label="Catalogue" size="small" sx={{ bgcolor: MODULE_COLORS.Catalogue.bg, color: MODULE_COLORS.Catalogue.text, fontWeight: 600 }} />
      </Box>

      {/* ── Row 1: Couverture (4) + Publication par Catégorie (4) + Masqués (4) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Couverture Catalogue */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Couverture Catalogue — {d.totalSKUs} produits
              </Typography>
            </Box>

            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Publiés', value: d.publishedSKUs },
                    { name: 'Brouillons', value: d.draftSKUs },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  <Cell fill={CATEGORICAL[1]} />
                  <Cell fill={CATEGORICAL[3]} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <Typography variant="h6" textAlign="center" fontWeight={700}>{d.totalSKUs} SKUs</Typography>
            <Typography variant="caption" display="block" textAlign="center" sx={{ color: 'text.secondary' }}>
              Taux publication: {d.tauxPublication.toFixed(0)}% · Indexation OpenSearch: {d.totalSKUs} produits · Latence: {osHealth.latencyMs}ms
            </Typography>
          </Paper>
        </Grid>

        {/* Taux publication par catégorie */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }} gutterBottom>
              Taux publication par catégorie
            </Typography>

            <ResponsiveContainer width="100%" height={Math.max(240, d.publicationByCategory.length * 38)}>
              <BarChart data={d.publicationByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="taux" name="Taux" fill={CATEGORICAL[0]} barSize={14}>
                  {d.publicationByCategory.map((entry, idx) => (
                    <Cell key={idx} fill={entry.taux < 90 ? CATEGORICAL[2] : CATEGORICAL[1]} />
                  ))}
                </Bar>
                <ReferenceLine x={avgTaux} stroke="#f85149" strokeDasharray="5 5" />
              </BarChart>
            </ResponsiveContainer>

            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
              Accessoires: 8 produits bloqués (brouillons OCR non validés)
            </Typography>
          </Paper>
        </Grid>

        {/* Produits masqués automatiquement */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                {d.totalMasked} produits masqués automatiquement
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="Catalogue" size="small" sx={{ bgcolor: MODULE_COLORS.Catalogue.bg, color: MODULE_COLORS.Catalogue.text, fontWeight: 600 }} />
                <Chip label="Inventaire" size="small" sx={{ bgcolor: MODULE_COLORS.Inventaire.bg, color: MODULE_COLORS.Inventaire.text, fontWeight: 600 }} />
              </Box>
            </Box>

            <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 12 } }}>
              {d.totalMasked} produits masqués = {d.totalMasked} pages zéro vente. Impact CA estimé: ~180 000 DZD/mois si en stock.
            </Alert>

            {d.maskedProducts.slice(0, 3).map((row) => (
              <Box key={row.sku} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{row.nameFr}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.sku}</Typography>
                  </Box>
                  <Button size="small" sx={{ textTransform: 'none', fontSize: 11 }}>Voir BC</Button>
                </Box>
                <Typography variant="caption" color="error">
                  0 unités · Rupture · {row.reason} · Perte(j): {fmtDZDShort(row.daysHidden * 1000)}
                </Typography>
              </Box>
            ))}

            <Typography variant="body2" color="error" fontWeight={600} sx={{ mt: 1 }}>
              Impact total estimé: ~180 000 DZD/mois
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 2: Top 10 (7) + Taux Retour (5) ── */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Top 10 Produits — CA et Marge FIFO (30j)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🔒 Finance + Inventory Manager
              </Typography>
            </Box>

            <ResponsiveContainer width="100%" height={Math.max(300, topProducts.length * 36)}>
              <ComposedChart data={topProducts} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v: number) => fmtDZDShort(v)} tick={{ fontSize: 11 }} />
                <YAxis dataKey="nameFr" type="category" width={115} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number, name: string) => name === 'CA' ? fmtDZD(value) : `${value}%`} />
                <Legend />
                <Bar dataKey="ca" name="CA" barSize={12}>
                  {topProducts.map((_: any, idx: number) => (
                    <Cell key={idx} fill={slateBarColor(idx)} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="marge" name="Marge %" stroke="#2ea043" strokeWidth={2} dot={{ r: 3, fill: '#FFFFFF', stroke: '#2ea043', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>

            <Alert severity="success" sx={{ mt: 1.5, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 12 } }}>
              {topProducts[0]?.nameFr}: marge la plus élevée ({topProducts[0]?.marge}%) mais CA moyen. Opportunité: augmenter visibilité Catalogue + WhatsApp.
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Taux de Retour — Produits signalés
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="CRM" size="small" sx={{ bgcolor: MODULE_COLORS.CRM.bg, color: MODULE_COLORS.CRM.text, fontWeight: 600 }} />
                <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
                <Chip label="PIM" size="small" sx={{ bgcolor: MODULE_COLORS.PIM.bg, color: MODULE_COLORS.PIM.text, fontWeight: 600 }} />
              </Box>
            </Box>

            <ResponsiveContainer width="100%" height={Math.max(250, d.tauxRetourProduits.length * 38)}>
              <BarChart data={d.tauxRetourProduits} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'auto']} unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="nameFr" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="tauxRetour" name="Taux Retour" barSize={16}>
                  {d.tauxRetourProduits.map((row: any, idx: number) => (
                    <Cell key={idx} fill={row.tauxRetour >= d.returnThreshold ? '#f85149' : '#8b949e'} />
                  ))}
                </Bar>
                <ReferenceLine x={d.returnThreshold} stroke="#f85149" strokeDasharray="5 5" label={{ value: `Seuil ${d.returnThreshold}%`, position: 'top', fill: '#f85149', fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Seuil PIM signalement: {d.returnThreshold}%
            </Typography>
            <Alert severity="error" sx={{ mt: 1, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
              {d.tauxRetourProduits.filter(p => p.tauxRetour > d.returnThreshold).length} produits au-dessus du seuil. Revoir description produit PIM + guide des tailles.
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Performance Canal (4) + Lacunes OpenSearch (4) + Santé Indexation (4) ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Performance par Canal
              </Typography>
              <Box display="flex" gap={0.5}>
                <Chip label="Catalogue" size="small" sx={{ bgcolor: MODULE_COLORS.Catalogue.bg, color: MODULE_COLORS.Catalogue.text, fontWeight: 600 }} />
                <Chip label="OMS" size="small" sx={{ bgcolor: MODULE_COLORS.OMS.bg, color: MODULE_COLORS.OMS.text, fontWeight: 600 }} />
              </Box>
            </Box>

            {d.channelPerformance.map((ch) => (
              <Box key={ch.channel} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>{ch.channel}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>{fmtNumber(ch.commandes)}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Commandes</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>{ch.tauxLivraison.toFixed(0)}%</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Taux livraison</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>{fmtDZDShort(ch.panierMoyen)}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Panier moyen</Typography>
                  </Box>
                </Box>
              </Box>
            ))}

            <Typography variant="caption" sx={{ color: 'success.main', display: 'block', mt: 1 }}>
              WhatsApp: taux livraison supérieur (+4 pts) car clients plus engagés.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Phase 2 — Marketplace Jumia.dz non actif · Estimé Q4 2026
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                {d.totalLacunes} lacunes OpenSearch (7j)
              </Typography>
              <Chip label="Catalogue (OpenSearch)" size="small" sx={{ bgcolor: MODULE_COLORS.Catalogue.bg, color: MODULE_COLORS.Catalogue.text, fontWeight: 600, fontSize: 10 }} />
            </Box>

            <ResponsiveContainer width="100%" height={Math.max(180, d.lacunesOpenSearch.slice(0, 5).length * 38)}>
              <BarChart data={d.lacunesOpenSearch.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="query" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Recherches" barSize={14}>
                  {d.lacunesOpenSearch.slice(0, 5).map((_: any, idx: number) => (
                    <Cell key={idx} fill={orangeBarColor(idx)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
              + {Math.max(0, d.totalLacunes - 5)} autres requêtes sans résultat
            </Typography>

            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mt: 1.5, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
              Chaque requête sans résultat = client perdu. Revenu potentiel manqué: ~890 000 DZD/mois. Action: Ajouter ces produits dans PIM.
            </Alert>

            <Button fullWidth variant="outlined" sx={{ mt: 1.5, textTransform: 'none', borderColor: 'divider' }}>
              Signaler à PIM Manager
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: 15 }}>
                Santé Indexation OpenSearch
              </Typography>
              <Chip label="Catalogue" size="small" sx={{ bgcolor: MODULE_COLORS.Catalogue.bg, color: MODULE_COLORS.Catalogue.text, fontWeight: 600 }} />
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: osHealth.status === 'green' ? 'success.main' : 'warning.main' }} />
              <Typography variant="body2">
                En ligne · {osHealth.latencyMs}ms latence · {osHealth.docsIndexed} docs
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h5" fontWeight={700} color="success.main">{osHealth.docsIndexed}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Documents indexés</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h5" fontWeight={700} color="success.main">{osHealth.latencyMs}ms</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Latence moyenne</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h5" fontWeight={700}>{osHealth.score.toFixed(2)}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Score pertinence /1.0</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography fontWeight={700} sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{relativeTime(osHealth.lastReindex)}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Dernière ré-indexation</Typography>
              </Grid>
            </Grid>

            {osHealth.indexRate < 100 && (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 1.5, '& .MuiAlert-message': { fontSize: 11 } }}>
                {Math.round(osHealth.totalDocs - osHealth.docsIndexed)} erreurs d&apos;indexation · {Math.round(osHealth.totalDocs - osHealth.docsIndexed)} brouillons non indexés
              </Alert>
            )}

            <Button fullWidth variant="outlined" sx={{ mt: 1.5, textTransform: 'none', borderColor: 'divider', color: 'text.secondary', '&:hover': { bgcolor: 'background.paper', borderColor: 'divider' } }}>
              Forcer ré-indexation
            </Button>

            <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 1 }}>
              Cluster OpenSearch Interne · Hébergé Algérie · Conforme Banque d&apos;Algérie
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
