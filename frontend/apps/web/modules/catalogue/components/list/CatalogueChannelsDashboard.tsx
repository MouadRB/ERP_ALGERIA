'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import type { CatalogueEntry, OpenSearchStatus } from '../../catalogue.types';
import { getSearchHealthMeta } from '../../catalogue.ui';

type CatalogueChannelsDashboardProps = {
  onNotify?: (message: string) => void;
  onReindex: () => Promise<void> | void;
  openSearchStatus?: OpenSearchStatus;
  reindexPending?: boolean;
  rows: CatalogueEntry[];
};

type RuleRowProps = {
  caption?: string;
  checked: boolean;
  chip?: string;
  disabled?: boolean;
  helper?: string;
  locked?: boolean;
  onChange: (checked: boolean) => void;
  secondaryHelper?: string;
  title: string;
};

const DEFAULT_LATENCY_MS = 48;

const INITIAL_FR_MESSAGE =
  'Bonjour ! Bienvenue chez FERZA, votre boutique en ligne algerienne.';
const INITIAL_AR_MESSAGE =
  'مرحبا بكم في فيرزا، متجركم الإلكتروني الجزائري.';

const parseThreshold = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDateTime = (dateIso: string) => {
  const date = new Date(dateIso);
  return date.toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ` ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatTimeAgo = (dateIso: string | null | undefined) => {
  if (!dateIso) return 'Aucune sync';
  const date = new Date(dateIso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.round(diffMs / 60000), 0);

  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `il y a ${hours} h ${minutes} min`;
};

const formatDuration = (dateIso: string | null | undefined) => {
  if (!dateIso) return '0m';
  const date = new Date(dateIso);
  const diffMs = Math.max(Date.now() - date.getTime(), 0);
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
};

export default function CatalogueChannelsDashboard({
  onNotify,
  onReindex,
  openSearchStatus,
  reindexPending,
  rows,
}: CatalogueChannelsDashboardProps) {
  const [websiteRules, setWebsiteRules] = useState({
    autoMaskZero: true,
    autoPublishPim: false,
    autoRepublish: false,
    blockInvalidOcr: true,
    excludeNegativeStock: true,
    maskDiscontinued: true,
    maskZeroPrice: false,
    stockLimitBadge: true,
  });
  const [websiteThreshold, setWebsiteThreshold] = useState('10');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappRules, setWhatsappRules] = useState({
    autoSync: true,
    excludeIndividualVariants: true,
    excludeZeroStock: false,
    excludeHighPrice: true,
    includeAboveMinPrice: true,
    requireMainImage: false,
  });
  const [whatsappMaxPrice, setWhatsappMaxPrice] = useState('50000');
  const [whatsappMinPrice, setWhatsappMinPrice] = useState('500');
  const [messageFr, setMessageFr] = useState(INITIAL_FR_MESSAGE);
  const [messageAr, setMessageAr] = useState(INITIAL_AR_MESSAGE);
  const [syncHistoryOpen, setSyncHistoryOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(
    () => new Date(Date.now() - 107 * 60 * 1000).toISOString(),
  );
  const [syncHistory, setSyncHistory] = useState(() => [
    {
      detail: '412 produits synchronises - 0 erreurs',
      id: 'sync-001',
      title: 'Sync catalogue reussie',
      at: new Date(Date.now() - 107 * 60 * 1000).toISOString(),
    },
    {
      detail: '12 fiches mises a jour depuis Meta Business',
      id: 'sync-002',
      title: 'Delta sync appliquee',
      at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const searchHealth = getSearchHealthMeta(openSearchStatus?.health ?? 'green');
  const stockThreshold = parseThreshold(websiteThreshold, 10);
  const whatsappMax = parseThreshold(whatsappMaxPrice, 50000);
  const whatsappMin = parseThreshold(whatsappMinPrice, 500);

  const dashboard = useMemo(() => {
    const websiteRows = rows.filter(
      (row) => row.channelDetails.some((channel) => channel.id === 'website') || websiteRules.autoPublishPim,
    );

    const websiteMaskedRaw = websiteRows.filter((row) => {
      const available = row.inventory?.quantityAvailable ?? row.availableStock ?? 0;
      const hasNegativeStock =
        row.inventory?.warehouseBreakdown?.some(
          (warehouse) => warehouse.available < 0 || warehouse.total < 0,
        ) ?? false;

      return (
        (websiteRules.autoMaskZero && available <= 0) ||
        (websiteRules.excludeNegativeStock && hasNegativeStock) ||
        (websiteRules.maskZeroPrice && row.priceTTC <= 0) ||
        (websiteRules.maskDiscontinued && row.status === 'masked')
      );
    }).length;

    const websiteScheduledRaw = websiteRows.filter((row) => Boolean(row.scheduledPublishAt)).length;

    const websitePublishedRaw = websiteRows.filter((row) => {
      const available = row.inventory?.quantityAvailable ?? row.availableStock ?? 0;
      const hasNegativeStock =
        row.inventory?.warehouseBreakdown?.some(
          (warehouse) => warehouse.available < 0 || warehouse.total < 0,
        ) ?? false;

      const isBlocked =
        (websiteRules.autoMaskZero && available <= 0) ||
        (websiteRules.excludeNegativeStock && hasNegativeStock) ||
        (websiteRules.maskZeroPrice && row.priceTTC <= 0) ||
        (websiteRules.maskDiscontinued && row.status === 'masked') ||
        (websiteRules.blockInvalidOcr && row.status === 'draft');

      if (row.scheduledPublishAt) return false;
      if (row.status === 'draft' && !websiteRules.autoPublishPim) return false;
      return !isBlocked;
    }).length;

    const whatsappPublishedRaw = whatsappEnabled
      ? rows.filter((row) => {
          const hasMainImage = Boolean(row.product?.mediaUrls?.[0]);
          const stock = row.inventory?.quantityAvailable ?? row.availableStock ?? 0;
          const isDraftLike = row.status === 'draft' || row.status === 'scheduled' || row.status === 'masked';

          if (isDraftLike) return false;
          if (whatsappRules.requireMainImage && !hasMainImage) return false;
          if (whatsappRules.excludeHighPrice && row.priceTTC > whatsappMax) return false;
          if (whatsappRules.includeAboveMinPrice && row.priceTTC < whatsappMin) return false;
          if (whatsappRules.excludeIndividualVariants && row.variantCount <= 1) return false;
          if (whatsappRules.excludeZeroStock && stock <= 0) return false;
          return true;
        }).length
      : 0;

    const whatsappExcludedRaw = whatsappEnabled ? Math.max(rows.length - whatsappPublishedRaw, 0) : 0;
    const indexedRaw =
      openSearchStatus?.totalIndexed ?? rows.filter((row) => row.openSearchIndexed).length;

    return {
      globalScore: Math.min(
        0.55 + (indexedRaw / Math.max(websiteRows.length, 1)) * 0.4,
        0.97,
      ),
      indexedDocuments: indexedRaw,
      websiteMasked: websiteMaskedRaw,
      websitePublished: websitePublishedRaw,
      websiteScheduled: websiteScheduledRaw,
      whatsappExcluded: whatsappExcludedRaw,
      whatsappPublished: whatsappPublishedRaw,
    };
  }, [
    openSearchStatus?.totalIndexed,
    rows,
    stockThreshold,
    whatsappEnabled,
    whatsappMax,
    whatsappMin,
    websiteRules.autoMaskZero,
    websiteRules.autoPublishPim,
    websiteRules.blockInvalidOcr,
    websiteRules.excludeNegativeStock,
    websiteRules.maskDiscontinued,
    websiteRules.maskZeroPrice,
    whatsappRules.excludeHighPrice,
    whatsappRules.excludeIndividualVariants,
    whatsappRules.excludeZeroStock,
    whatsappRules.includeAboveMinPrice,
    whatsappRules.requireMainImage,
  ]);

  const handleSyncNow = async () => {
    if (!whatsappEnabled || syncing) return;

    setSyncing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const now = new Date().toISOString();
    setLastSyncAt(now);
    setSyncHistory((current) => [
      {
        detail: `${dashboard.whatsappPublished} produits synchronises - 0 erreurs`,
        id: `sync-${Date.now()}`,
        title: 'Synchronisation manuelle terminee',
        at: now,
      },
      ...current,
    ]);
    setSyncing(false);
    onNotify?.('Synchronisation WhatsApp terminee.');
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack direction="row" spacing={1.5}>
                <IconBubble color="#2ea043" soft="rgba(46,160,67,0.15)" icon={<LanguageOutlinedIcon sx={{ fontSize: 25 }} />} />
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    Site Web
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.35 }}>
                    <Chip label="En ligne" size="small" sx={{ bgcolor: 'rgba(46,160,67,0.15)', color: 'success.main', fontWeight: 700 }} />
                    <Typography variant="body2" color="text.secondary">
                      ferza.dz
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={0.25} alignItems="center">
                <Switch checked disabled />
                <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Stack>
            </Stack>

            <Grid container spacing={1.25} sx={{ mt: 1.4 }}>
              <Grid item xs={6} md={3}>
                <MetricTile label="publies" tone="#2ea043" value={String(dashboard.websitePublished)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <MetricTile label="masques" tone="#f85149" value={String(dashboard.websiteMasked)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <MetricTile label="planifies" tone="#bc8cff" value={String(dashboard.websiteScheduled)} />
              </Grid>
              <Grid item xs={6} md={3}>
                <MetricTile label="Latence" tone="#58a6ff" value={`${DEFAULT_LATENCY_MS}ms`} />
              </Grid>
            </Grid>

            <Typography variant="overline" sx={{ mt: 2.1, display: 'block', color: 'text.secondary', fontWeight: 800 }}>
              Regles Automatiques
            </Typography>

            <Stack divider={<Divider flexItem sx={{ borderColor: 'divider' }} />} sx={{ mt: 0.75 }}>
              <RuleRow
                caption="Lie au module Inventory - Application instantanee - Non modifiable"
                checked={websiteRules.autoMaskZero}
                chip="Inventaire -> Catalogue"
                helper="Stock Soft et Hard reserves ne comptent pas comme disponibles"
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, autoMaskZero: checked }))}
                title="Masquer si stock disponible = 0"
              />
              <RuleRow
                caption="Declenche par reception de stock dans Inventory (mouvement d'entree FIFO)"
                checked={websiteRules.autoRepublish}
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, autoRepublish: checked }))}
                title="Republier auto si stock dispo > 0"
              />
              <RuleRow
                caption="Declenche par module PIM"
                checked={websiteRules.maskDiscontinued}
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, maskDiscontinued: checked }))}
                title="Masquer si produit Discontinue (PIM)"
              />
              <RuleRow
                checked={websiteRules.maskZeroPrice}
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, maskZeroPrice: checked }))}
                title="Masquer si prix = 0 DZD"
              />
              <RuleRow
                caption={`Seuil personnalisable - Actuellement: dispo <= ${stockThreshold} unites`}
                checked={websiteRules.stockLimitBadge}
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, stockLimitBadge: checked }))}
                title="Badge 'Stock Limite' si dispo <= seuil"
              />
              <Box sx={{ px: 0.25, pb: 1.1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    type="number"
                    value={websiteThreshold}
                    onChange={(event) => setWebsiteThreshold(event.target.value)}
                    sx={{ width: 84 }}
                    inputProps={{ min: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    unites
                  </Typography>
                </Stack>
              </Box>
              <RuleRow
                caption="Garantit que seuls les produits PIM Actif sont publiables"
                checked={websiteRules.blockInvalidOcr}
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, blockInvalidOcr: checked }))}
                title="Ne pas publier si brouillon OCR non valide"
              />
              <RuleRow
                caption="Si active: tout produit Actif dans PIM est auto-publie"
                checked={websiteRules.autoPublishPim}
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, autoPublishPim: checked }))}
                title="Auto-publication des nouveaux produits PIM"
              />
              <RuleRow
                caption="Stock negatif = anomalie de donnees - Correction dans Inventaire requise"
                checked={websiteRules.excludeNegativeStock}
                chip="Inventaire -> Catalogue"
                helper="Anomalie inventaire detectee"
                onChange={(checked) => setWebsiteRules((current) => ({ ...current, excludeNegativeStock: checked }))}
                title="Exclure variantes avec stock negatif"
              />
            </Stack>

            <Typography variant="overline" sx={{ mt: 2.2, display: 'block', color: 'text.secondary', fontWeight: 800 }}>
              Index OpenSearch
            </Typography>

            <Stack spacing={0.7} sx={{ mt: 0.8 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <Box component="span" sx={{ color: searchHealth.color, mr: 0.75 }}>
                  ●
                </Box>
                Cluster en ligne - Heberge en Algerie - Conforme Banque d&apos;Algerie
              </Typography>
              <Stack direction="row" justifyContent="space-between" flexWrap="wrap" rowGap={0.5}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16, mr: 0.75, color: 'success.main', verticalAlign: 'text-bottom' }} />
                  {dashboard.indexedDocuments} documents indexes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latence moy: {DEFAULT_LATENCY_MS}ms
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" flexWrap="wrap" rowGap={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Derniere sync: {formatTimeAgo(openSearchStatus?.lastIndexedAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score pertinence: {dashboard.globalScore.toFixed(2)}/1.0
                </Typography>
              </Stack>
              <Box sx={{ mt: 0.6 }}>
                <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'rgba(88,166,255,0.15)', overflow: 'hidden' }}>
                  <Box sx={{ width: `${Math.round(dashboard.globalScore * 100)}%`, height: '100%', bgcolor: 'primary.main' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6, display: 'block' }}>
                  Score de pertinence global: {dashboard.globalScore.toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                disabled={reindexPending}
                onClick={() => void onReindex()}
                sx={{ mt: 1, borderRadius: 999, minHeight: 42 }}
              >
                {reindexPending ? 'Re-indexation en cours... (~3 min)' : 'Forcer re-indexation'}
              </Button>

              <Box sx={{ mt: 0.8, borderRadius: 3, px: 1.25, py: 1.1, bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={600}>
                    Prix verrouille en snapshot a la confirmation de commande COD. Toute modification dans PIM n&apos;affecte pas les commandes en cours.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack direction="row" spacing={1.5}>
                <IconBubble color="#2ea043" soft="rgba(46,160,67,0.15)" icon={<ChatOutlinedIcon sx={{ fontSize: 24 }} />} />
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    WhatsApp Business
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.35, flexWrap: 'wrap' }}>
                    <Chip label={whatsappEnabled ? 'Connecte' : 'Suspendu'} size="small" sx={{ bgcolor: whatsappEnabled ? 'rgba(46,160,67,0.15)' : 'rgba(139,148,158,0.15)', color: whatsappEnabled ? '#2ea043' : '#8b949e', fontWeight: 700 }} />
                    <Chip label="API Meta Business" size="small" sx={{ bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main', fontWeight: 700 }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Catalogue ID: wh_cat_ferza_01
                  </Typography>
                </Box>
              </Stack>

              <Switch
                checked={whatsappEnabled}
                onChange={(_, checked) => {
                  setWhatsappEnabled(checked);
                  onNotify?.(checked ? 'Canal WhatsApp active.' : 'Canal WhatsApp suspendu.');
                }}
              />
            </Stack>

            <Grid container spacing={1.25} sx={{ mt: 1.4 }}>
              <Grid item xs={6} md={4}>
                <MetricTile label="publies" tone="#2ea043" value={String(dashboard.whatsappPublished)} />
              </Grid>
              <Grid item xs={6} md={4}>
                <MetricTile label="exclus (manuel)" tone="#d29922" value={String(dashboard.whatsappExcluded)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <MetricTile label="Derniere sync" tone="#58a6ff" value={formatDuration(lastSyncAt)} />
              </Grid>
            </Grid>

            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.25} sx={{ mt: 1.5, mb: 1.4 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Derniere sync reussie: {formatDateTime(lastSyncAt)}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                size="small"
                startIcon={<SyncOutlinedIcon />}
                disabled={!whatsappEnabled || syncing}
                onClick={() => void handleSyncNow()}
                sx={{ borderRadius: 999, alignSelf: { xs: 'flex-start', md: 'center' } }}
              >
                {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
              </Button>
            </Stack>

            <Typography variant="overline" sx={{ mt: 1.2, display: 'block', color: 'text.secondary', fontWeight: 800 }}>
              Regles WhatsApp
            </Typography>

            <Stack divider={<Divider flexItem sx={{ borderColor: 'divider' }} />} sx={{ mt: 0.75 }}>
              <RuleRow
                checked={whatsappRules.requireMainImage}
                disabled={!whatsappEnabled}
                onChange={(checked) => setWhatsappRules((current) => ({ ...current, requireMainImage: checked }))}
                title="Image principale obligatoire"
              />
              <RuleRow
                checked={whatsappRules.excludeHighPrice}
                disabled={!whatsappEnabled}
                onChange={(checked) => setWhatsappRules((current) => ({ ...current, excludeHighPrice: checked }))}
                title="Exclure si prix > seuil"
              />
              <Box sx={{ px: 0.25, pb: 1.1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField size="small" type="number" value={whatsappMaxPrice} onChange={(event) => setWhatsappMaxPrice(event.target.value)} disabled={!whatsappEnabled} sx={{ width: 104 }} />
                  <Typography variant="body2" color="text.secondary">
                    DZD
                  </Typography>
                </Stack>
              </Box>
              <RuleRow
                checked={whatsappRules.excludeIndividualVariants}
                disabled={!whatsappEnabled}
                onChange={(checked) => setWhatsappRules((current) => ({ ...current, excludeIndividualVariants: checked }))}
                title="Exclure variantes individuelles (parent seulement)"
              />
              <RuleRow
                checked={whatsappRules.includeAboveMinPrice}
                disabled={!whatsappEnabled}
                onChange={(checked) => setWhatsappRules((current) => ({ ...current, includeAboveMinPrice: checked }))}
                title="Inclure seulement si prix >"
              />
              <Box sx={{ px: 0.25, pb: 1.1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField size="small" type="number" value={whatsappMinPrice} onChange={(event) => setWhatsappMinPrice(event.target.value)} disabled={!whatsappEnabled} sx={{ width: 84 }} />
                  <Typography variant="body2" color="text.secondary">
                    DZD
                  </Typography>
                </Stack>
              </Box>
              <RuleRow
                checked={whatsappRules.excludeZeroStock}
                chip="Inventaire -> Catalogue"
                disabled={!whatsappEnabled}
                onChange={(checked) => setWhatsappRules((current) => ({ ...current, excludeZeroStock: checked }))}
                title="Exclure si stock disponible = 0"
              />
              <RuleRow
                caption="Toutes les 2 heures"
                checked={whatsappRules.autoSync}
                disabled={!whatsappEnabled}
                onChange={(checked) => setWhatsappRules((current) => ({ ...current, autoSync: checked }))}
                title="Frequence synchronisation auto"
              />
            </Stack>

            <Typography variant="overline" sx={{ mt: 2.2, display: 'block', color: 'text.secondary', fontWeight: 800 }}>
              Messages Bilingues
            </Typography>

            <Stack spacing={1.25} sx={{ mt: 0.75 }}>
              <TextField multiline minRows={2} value={messageFr} onChange={(event) => setMessageFr(event.target.value)} disabled={!whatsappEnabled} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' } }} />
              <TextField multiline minRows={2} value={messageAr} onChange={(event) => setMessageAr(event.target.value)} disabled={!whatsappEnabled} inputProps={{ dir: 'rtl' }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' } }} />
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ cursor: 'pointer', color: 'text.secondary' }} onClick={() => setSyncHistoryOpen((current) => !current)}>
                <ExpandMoreOutlinedIcon sx={{ fontSize: 18, transform: syncHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }} />
                <Typography variant="body2" fontWeight={600}>
                  Historique sync
                </Typography>
              </Stack>
              <Collapse in={syncHistoryOpen}>
                <Stack spacing={1.1} sx={{ mt: 1.1 }}>
                  {syncHistory.map((item) => (
                    <Paper key={item.id} variant="outlined" sx={{ borderRadius: 3, p: 1.25, borderColor: 'divider', bgcolor: '#f8fbff' }}>
                      <Typography variant="body2" fontWeight={700}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.detail}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(item.at)}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider', opacity: 0.48, bgcolor: 'background.paper' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack direction="row" spacing={1.5}>
                <IconBubble color="#8b949e" soft="#30363d" icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 22 }} />} />
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    Marketplace (Jumia.dz)
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.35, flexWrap: 'wrap' }}>
                    <Chip label="Phase 3 - Non disponible" size="small" sx={{ bgcolor: 'rgba(210,153,34,0.15)', color: 'warning.main', fontWeight: 700 }} />
                    <Chip label="Estime: Q4 2026" size="small" sx={{ bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 700 }} />
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={0.25} alignItems="center">
                <Switch checked={false} disabled />
                <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </Stack>
            </Stack>

            <Paper variant="outlined" sx={{ mt: 2, borderRadius: 3, px: 1.25, py: 1.2, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Ce canal sera disponible en Phase 3. Actuellement: Site Web (Phase 1) + WhatsApp (Phase 1). Pre-configuration possible des maintenant.
                </Typography>
              </Stack>
            </Paper>

            <Button variant="outlined" fullWidth disabled sx={{ mt: 2, borderRadius: 999, minHeight: 42 }}>
              Configurer en avance (Phase 3)
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function IconBubble({
  color,
  icon,
  soft,
}: {
  color: string;
  icon: ReactNode;
  soft: string;
}) {
  return (
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: 999,
        bgcolor: soft,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
  );
}

function MetricTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        px: 1.2,
        py: 1.35,
        borderColor: `${tone}22`,
        bgcolor: `${tone}12`,
        textAlign: 'center',
        boxShadow: 'none',
      }}
    >
      <Typography variant="h4" fontWeight={800} sx={{ color: tone, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, color: tone, fontWeight: 600 }}>
        {label}
      </Typography>
    </Paper>
  );
}

function RuleRow({
  caption,
  checked,
  chip,
  disabled,
  helper,
  locked,
  onChange,
  secondaryHelper,
  title,
}: RuleRowProps) {
  return (
    <Box sx={{ py: 1.05 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Typography variant="body1" fontWeight={700} sx={{ color: 'text.primary' }}>
              {title}
            </Typography>
            {locked ? <LockOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> : null}
            {chip ? (
              <Chip
                label={chip}
                size="small"
                sx={{ bgcolor: '#e0f2fe', color: 'primary.main', fontWeight: 700 }}
              />
            ) : null}
          </Stack>
          {caption ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              {caption}
            </Typography>
          ) : null}
          {helper ? (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: '#fd8c73' }}>
              {helper}
            </Typography>
          ) : null}
          {secondaryHelper ? (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.15, color: 'text.secondary' }}>
              {secondaryHelper}
            </Typography>
          ) : null}
        </Box>
        <Switch checked={checked} disabled={disabled} onChange={(_, value) => onChange(value)} />
      </Stack>
    </Box>
  );
}
