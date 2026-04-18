'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Drawer,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import IconButton from '@mui/material/IconButton';
import { useParams, useRouter } from 'next/navigation';
import { useViewMode } from '@/hooks/shared/useViewMode';
import CatalogueDetailHeader from '@/modules/catalogue/components/detail/CatalogueDetailHeader';
import CatalogueDetailTabs from '@/modules/catalogue/components/detail/CatalogueDetailTabs';
import ApercuClientModal from '@/modules/catalogue/components/modals/ApercuClientModal';
import type { CatalogueEntry, CatalogueInventorySummary } from '@/modules/catalogue/catalogue.types';
import { useCatalogueItem } from '@/modules/catalogue/hooks/useCatalogueItem';
import { useMaskProduct } from '@/modules/catalogue/hooks/useMaskProduct';
import { useOpenSearchStatus } from '@/modules/catalogue/hooks/useOpenSearchStatus';
import { usePublishProduct } from '@/modules/catalogue/hooks/usePublishProduct';
import { useReindexOpenSearch } from '@/modules/catalogue/hooks/useReindexOpenSearch';
import { useSchedulePublication } from '@/modules/catalogue/hooks/useSchedulePublication';
import { useToggleChannelStatus } from '@/modules/catalogue/hooks/useToggleChannelStatus';
import { useUnpublishProduct } from '@/modules/catalogue/hooks/useUnpublishProduct';
import { useUpdateCatalogue } from '@/modules/catalogue/hooks/useUpdateCatalogue';
import { useCatalogueHistory } from '@/modules/catalogue/hooks/useCatalogueHistory';
import {
  formatDZD,
  formatPercent,
  getCatalogueStatusMeta,
  getSearchHealthMeta,
  getCatalogueVisual,
} from '@/modules/catalogue/catalogue.ui';
import { useInventorySKU } from '@/modules/inventory/hooks/useInventorySKU';

export default function CatalogueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = typeof params.locale === 'string' ? params.locale : 'fr';
  const id = typeof params.id === 'string' ? params.id : '';
  const { isReadOnly } = useViewMode();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState('');

  const detailQuery = useCatalogueItem(id);
  const entry = detailQuery.data?.data;
  const openSearchStatus = useOpenSearchStatus();
  const reindexMutation = useReindexOpenSearch();
  const scheduleMutation = useSchedulePublication();
  const maskMutation = useMaskProduct();
  const publishMutation = usePublishProduct();
  const unpublishMutation = useUnpublishProduct();
  const toggleChannelMutation = useToggleChannelStatus();
  const updateMutation = useUpdateCatalogue();
  const historyQuery = useCatalogueHistory(id);
  const inventoryQuery = useInventorySKU(entry?.sku ?? '');
  const inventory = inventoryQuery.data?.data ?? entry?.inventory;

  if (detailQuery.isLoading) {
    return (
      <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!entry) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Entree catalogue introuvable.</Typography>
      </Box>
    );
  }

  const mergedEntry = { ...entry, inventory: inventory as CatalogueInventorySummary | undefined };
  const visual = getCatalogueVisual(mergedEntry.id);
  const searchHealth = getSearchHealthMeta(openSearchStatus.data?.data.health ?? 'green');
  const inventoryTotal = Math.max(inventory?.quantityOnHand ?? 0, 1);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100%' }}>
      {isReadOnly && (
        <Paper elevation={0} sx={{ bgcolor: 'rgba(88,166,255,0.15)', border: '1px solid #58a6ff', borderRadius: 2, p: 1.5, mb: 2, textAlign: 'center' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
            Mode consultation — Les modifications sont désactivées
          </Typography>
        </Paper>
      )}
      <CatalogueDetailHeader
        entry={mergedEntry}
        locale={locale}
        isReadOnly={isReadOnly}
        onPreview={() => setPreviewOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        onPublish={async () => {
          await publishMutation.mutateAsync(entry.id);
          setToast('Produit publie.');
        }}
        onSave={async () => {
          await updateMutation.mutateAsync({
            id: entry.id,
            data: {
              nameFr: entry.nameFr,
              nameAr: entry.nameAr,
              categoryId: entry.categoryId,
              categoryPath: entry.categoryPath,
              priceTTC: entry.priceTTC,
              visibilityRules: entry.visibilityRules,
            },
          });
          setToast('Catalogue enregistre avec succes.');
        }}
        onUnpublish={async () => {
          await unpublishMutation.mutateAsync(entry.id);
          setToast('Produit de-publie.');
        }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <CatalogueDetailTabs
            actionPending={
              publishMutation.isPending ||
              unpublishMutation.isPending ||
              maskMutation.isPending ||
              scheduleMutation.isPending
            }
            entry={mergedEntry}
            tab={activeTab}
            onTabChange={setActiveTab}
            channelTogglePending={toggleChannelMutation.isPending}
            onOpenInventory={() => router.push(`/${locale}/inventory/${mergedEntry.sku}`)}
            onPublishNow={async () => {
              await publishMutation.mutateAsync(mergedEntry.id);
              setToast('Produit publie.');
            }}
            onMaskNow={async () => {
              await maskMutation.mutateAsync(mergedEntry.id);
              setToast('Produit masque.');
            }}
            onUnpublishNow={async () => {
              await unpublishMutation.mutateAsync(mergedEntry.id);
              setToast('Produit de-publie.');
            }}
            onSchedulePublication={async (scheduledAt) => {
              await scheduleMutation.mutateAsync({ id: mergedEntry.id, scheduledAt, type: 'publish' });
              setToast('Publication planifiee.');
            }}
            onScheduleUnpublish={async (scheduledAt) => {
              await scheduleMutation.mutateAsync({ id: mergedEntry.id, scheduledAt, type: 'unpublish' });
              setToast('Depublication auto planifiee.');
            }}
            onToggleChannel={async (channelId, enabled) => {
              await toggleChannelMutation.mutateAsync({ id: mergedEntry.id, channelId, enabled });
              setToast(enabled ? 'Canal active.' : 'Canal suspendu.');
            }}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            <SummaryCard entry={mergedEntry} visual={visual} />
            <StockQuickCard
              entry={mergedEntry}
              inventoryTotal={inventoryTotal}
              onOpenInventory={() => router.push(`/${locale}/inventory/${mergedEntry.sku}`)}
            />
            <PerformanceCard entry={mergedEntry} />
            <OpenSearchCard
              entry={mergedEntry}
              healthColor={searchHealth.color}
              healthLabel={searchHealth.label}
              onReindex={async () => {
                await reindexMutation.mutateAsync();
                setToast('OpenSearch re-indexe.');
              }}
              pending={reindexMutation.isPending}
            />
            <AuditCard entry={mergedEntry} />
          </Stack>
        </Grid>
      </Grid>

      <ApercuClientModal open={previewOpen} entry={mergedEntry} onClose={() => setPreviewOpen(false)} />

      <Drawer anchor="right" open={historyOpen} onClose={() => setHistoryOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>Historique des modifications</Typography>
          <IconButton onClick={() => setHistoryOpen(false)}>
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
        <Stack spacing={1.5}>
          {(historyQuery.data?.data ?? mergedEntry.history).map((item: { id: string; type: string; title: string; subtitle: string; actor: string; at: string }) => (
            <Paper key={item.id} variant="outlined" sx={{ borderRadius: 3, p: 1.5, borderColor: 'divider' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                  {item.subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {item.subtitle}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', mt: 0.5 }}>
                    {item.actor}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                  {new Date(item.at).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  {' '}
                  {new Date(item.at).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Stack>
            </Paper>
          ))}
          {(historyQuery.data?.data ?? mergedEntry.history).length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun historique disponible.
            </Typography>
          )}
        </Stack>
      </Drawer>

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}

function SummaryCard({
  entry,
  visual,
}: {
  entry: CatalogueEntry;
  visual: { end: string; soft: string; start: string };
}) {
  const statusMeta = getCatalogueStatusMeta(entry.status);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
      <Stack direction="row" spacing={1.5}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            backgroundImage: entry.product?.mediaUrls?.[0] ? `url(${entry.product.mediaUrls[0]})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: (t) => t.palette.background.paper,
            background: entry.product?.mediaUrls?.[0]
              ? undefined
              : `linear-gradient(135deg, ${visual.start}, ${visual.end})`,
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={800} noWrap>{entry.nameFr}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{entry.nameAr}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 1.75 }} />
      <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
        Prix TTC: {formatDZD(entry.priceTTC)}
      </Typography>
      <Typography variant="body2" color="text.secondary">TVA: 19% Standard - HT: {formatDZD(Math.round(entry.priceTTC / 1.19))}</Typography>
      <Typography variant="body2" color="text.secondary">Categorie: {entry.categoryPath}</Typography>
      <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>SKU: {entry.sku}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5, color: '#fd8c73' }}>
        Variantes: {entry.variantCount} ({entry.product?.variants?.length ?? 0} disponibles)
      </Typography>
      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1.25 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: 'success.main' }} />
        <Typography variant="body2" sx={{ color: statusMeta.fg }}>
          {statusMeta.label} - {entry.channelCount} canaux
        </Typography>
      </Stack>
    </Paper>
  );
}

function StockQuickCard({
  entry,
  inventoryTotal,
  onOpenInventory,
}: {
  entry: CatalogueEntry;
  inventoryTotal: number;
  onOpenInventory: () => void;
}) {
  const inventory = entry.inventory;
  const available = inventory?.quantityAvailable ?? 0;
  const soft =
    inventory?.reservations
      ?.filter((reservation: { type: string }) => reservation.type === 'soft')
      .reduce((sum: number, reservation: { quantity: number }) => sum + reservation.quantity, 0) ??
    0;
  const hard =
    inventory?.reservations
      ?.filter((reservation: { type: string }) => reservation.type === 'hard')
      .reduce((sum: number, reservation: { quantity: number }) => sum + reservation.quantity, 0) ??
    0;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={800}>Stock (temps reel)</Typography>
        <Button size="small" onClick={onOpenInventory}>Ouvrir Inventaire</Button>
      </Stack>
      <Typography variant="h4" fontWeight={800} sx={{ color: '#fd8c73', mt: 1.25 }}>
        Dispo: {available}
      </Typography>
      <Typography variant="body2" sx={{ color: '#bc8cff' }}>S: {soft}  H: {hard}</Typography>
      <Typography variant="body2" color="text.secondary">
        Total: {inventoryTotal} unites
      </Typography>
      <Box sx={{ mt: 1.5, height: 16, borderRadius: 999, overflow: 'hidden', display: 'flex', bgcolor: 'action.hover' }}>
        <Box sx={{ width: `${(available / inventoryTotal) * 100}%`, bgcolor: 'success.main' }} />
        <Box sx={{ width: `${(soft / inventoryTotal) * 100}%`, bgcolor: '#bc8cff' }} />
        <Box sx={{ width: `${(hard / inventoryTotal) * 100}%`, bgcolor: 'primary.main' }} />
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="body2" sx={{ color: '#fd8c73' }}>Seuil: {inventory?.reorderPoint ?? 0} - Sous seuil depuis 2 jours</Typography>
      <Typography variant="body2" sx={{ color: 'primary.main' }}>Reappro. suggeree: {inventory?.suggestedReorderQty ?? 0} unites</Typography>
      <Typography variant="body2" sx={{ color: '#bc8cff' }}>{soft} Soft expirent dans moins de 75 min</Typography>
      <Button variant="outlined" fullWidth sx={{ mt: 1.5, borderRadius: 999 }} onClick={onOpenInventory}>
        Voir dans Inventory
      </Button>
    </Paper>
  );
}

function PerformanceCard({ entry }: { entry: CatalogueEntry }) {
  const returnPct = Math.round(entry.metrics.returnRate * 100);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={800}>Performance Catalogue (7j)</Typography>
      <Stack spacing={0.8} sx={{ mt: 1.25 }}>
        <Typography variant="body2">Vues: <b>{entry.metrics.views7d}</b></Typography>
        <Typography variant="body2">Ajouts panier: <b>{formatPercent(entry.metrics.addToCartRate, 1)}</b></Typography>
        <Typography variant="body2">Conversions: <b>{formatPercent(entry.metrics.conversionRate, 1)}</b></Typography>
        <Typography variant="body2">Top recherche: <b>{entry.metrics.topSearchTerm || 'Aucune'}</b></Typography>
      </Stack>
      <Divider sx={{ my: 1.25 }} />
      <Typography variant="body2" sx={{ color: '#fd8c73', fontWeight: 700 }}>
        Taux de retour: {returnPct}%
      </Typography>
      <Box sx={{ mt: 1, height: 5, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min(returnPct, 100)}%`, height: '100%', bgcolor: 'warning.main' }} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Seuil signalement PIM: 30%
      </Typography>
    </Paper>
  );
}

function OpenSearchCard({
  entry,
  healthColor,
  healthLabel,
  onReindex,
  pending,
}: {
  entry: CatalogueEntry;
  healthColor: string;
  healthLabel: string;
  onReindex: () => void;
  pending?: boolean;
}) {
  const tags = entry.metrics.topSearchTerm ? entry.metrics.topSearchTerm.split(' ').slice(0, 4) : [entry.categoryId.toLowerCase()];

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={800}>Index OpenSearch</Typography>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: healthColor }} />
        <Typography variant="body2">Indexe - il y a 12 min</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Documents: {entry.variantCount + 1} (1 parent + {entry.variantCount} variantes)
      </Typography>
      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700, mt: 0.5 }}>
        Score pertinence: {entry.openSearchIndexed ? '0.94/1.0' : `${healthLabel}`}
      </Typography>
      <Stack direction="row" spacing={0.6} flexWrap="wrap" sx={{ mt: 1 }}>
        {tags.map((tag: string) => (
          <Chip key={tag} label={tag} size="small" sx={{ bgcolor: 'background.paper' }} />
        ))}
      </Stack>
      <Typography variant="body2" sx={{ mt: 1.25, color: 'primary.main', fontWeight: 700 }}>
        Position #{entry.channelDetails.find((channel: { id: string }) => channel.id === 'website')?.searchRank ?? '-'} pour &quot;{entry.metrics.topSearchTerm || entry.nameFr}&quot;
      </Typography>
      <Box sx={{ mt: 1, height: 4, borderRadius: 999, bgcolor: 'rgba(88,166,255,0.15)', overflow: 'hidden' }}>
        <Box sx={{ width: '94%', height: '100%', bgcolor: 'primary.main' }} />
      </Box>
      <Button variant="outlined" fullWidth sx={{ mt: 1.5, borderRadius: 999 }} disabled={pending} onClick={onReindex}>
        {pending ? 'Re-indexation...' : 'Forcer re-indexation'}
      </Button>
    </Paper>
  );
}

function AuditCard({ entry }: { entry: CatalogueEntry }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={800}>Journal d&apos;Audit</Typography>
        <Chip label="Append-only" size="small" />
      </Stack>
      <Stack spacing={1.15} sx={{ mt: 1.5 }}>
        {entry.history.slice(0, 5).map((item: { actor: string; at: string; id: string; title: string }) => (
          <Stack key={item.id} direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="body2">{item.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(item.at).toLocaleDateString('fr-DZ')}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
