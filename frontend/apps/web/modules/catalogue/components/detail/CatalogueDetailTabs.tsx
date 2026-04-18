'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import type { CatalogueChannelDetail, CatalogueEntry } from '../../catalogue.types';
import PublicationHistoryTab from './tabs/PublicationHistoryTab';
import VisibilityRulesTab from './tabs/VisibilityRulesTab';
import {
  CHANNEL_ORDER,
  formatDZD,
  formatPercent,
  getCatalogueStatusMeta,
  getChannelMeta,
} from '../../catalogue.ui';

type CatalogueDetailTabsProps = {
  actionPending?: boolean;
  channelTogglePending?: boolean;
  entry: CatalogueEntry;
  onMaskNow: () => Promise<void>;
  onOpenInventory: () => void;
  onPublishNow: () => Promise<void>;
  onSchedulePublication: (scheduledAt: string) => Promise<void>;
  onScheduleUnpublish: (scheduledAt: string) => Promise<void>;
  onTabChange: (tab: number) => void;
  onToggleChannel: (channelId: string, enabled: boolean) => Promise<void> | void;
  onUnpublishNow: () => Promise<void>;
  tab: number;
};

type PlanningMode = 'immediate' | 'schedule' | 'auto-unpublish';
type ProductSettings = {
  autoPromo: boolean;
  homepageFeature: boolean;
  limitBadge: boolean;
  sponsoredSearch: boolean;
  whatsappPriceRestriction: boolean;
};

const TABS = [
  'Canaux & Publication',
  'Stock & Disponibilite',
  'Planification',
  'Regles de Visibilite',
  'Historique',
];

export default function CatalogueDetailTabs({
  actionPending,
  channelTogglePending,
  entry,
  onMaskNow,
  onOpenInventory,
  onPublishNow,
  onSchedulePublication,
  onScheduleUnpublish,
  onTabChange,
  onToggleChannel,
  onUnpublishNow,
  tab,
}: CatalogueDetailTabsProps) {
  const inventory = entry.inventory;
  const variants = entry.product?.variants ?? [];
  const available = inventory?.quantityAvailable ?? 0;
  const soft = inventory?.softReserved ?? 0;
  const hard = inventory?.hardReserved ?? 0;
  const quarantine = inventory?.quantityQuarantined ?? 0;
  const totalUnits = Math.max(inventory?.quantityOnHand ?? available + soft + hard + quarantine, 1);
  const publishedVariantCount = available > 0 ? variants.length : 0;
  const weightedAverageCost = useMemo(() => {
    const layers = inventory?.fifoLayers ?? [];
    if (layers.length === 0) return inventory?.weightedAverageCost ?? inventory?.costFifo ?? 0;
    const totalQty = layers.reduce((sum, layer) => sum + layer.quantityRemaining, 0);
    if (totalQty === 0) return inventory?.costFifo ?? 0;
    return Math.round(
      layers.reduce((sum, layer) => sum + layer.unitCostHT * layer.quantityRemaining, 0) / totalQty,
    );
  }, [inventory?.costFifo, inventory?.fifoLayers, inventory?.weightedAverageCost]);
  const stockValue =
    inventory?.stockValue ??
    inventory?.warehouseBreakdown?.reduce((sum, warehouse) => sum + warehouse.value, 0) ??
    0;
  const availableValue = inventory?.availableValue ?? available * (inventory?.costFifo ?? 0);
  const margin = Math.max(entry.priceTTC - (inventory?.costFifo ?? 0), 0);
  const marginRate = entry.priceTTC > 0 ? margin / entry.priceTTC : 0;

  const channels = useMemo(
    () =>
      CHANNEL_ORDER.map((channelId) => {
        const detail = entry.channelDetails.find((channel) => channel.id === channelId);
        if (detail) return detail;
        const meta = getChannelMeta(channelId);
        return {
          activeKeywords: 0,
          featuredPlacement: 'Aucune mise en avant',
          id: channelId,
          indexed: false,
          label: meta.label,
          searchRank: null,
          status: 'draft',
          subtitle: channelId === 'website' ? 'ferza.dz' : 'wh_cat_ferza_01',
        } satisfies CatalogueChannelDetail;
      }),
    [entry.channelDetails],
  );

  const [planningMode, setPlanningMode] = useState<PlanningMode>('immediate');
  const [publishAt, setPublishAt] = useState('');
  const [unpublishAt, setUnpublishAt] = useState('');
  const [productSettings, setProductSettings] = useState<ProductSettings>({
    autoPromo: false,
    homepageFeature: false,
    limitBadge: false,
    sponsoredSearch: false,
    whatsappPriceRestriction: false,
  });

  useEffect(() => {
    setPlanningMode(entry.scheduledUnpublishAt ? 'auto-unpublish' : entry.scheduledPublishAt ? 'schedule' : 'immediate');
    setPublishAt(toLocalDateTime(entry.scheduledPublishAt));
    setUnpublishAt(toLocalDateTime(entry.scheduledUnpublishAt));
    setProductSettings({
      autoPromo: Boolean(entry.scheduledPublishAt),
      homepageFeature: entry.metrics.views7d >= 1000,
      limitBadge: available <= entry.visibilityRules.minStock,
      sponsoredSearch: entry.metrics.conversionRate >= 0.03,
      whatsappPriceRestriction: entry.priceTTC > 50000,
    });
  }, [
    available,
    entry.id,
    entry.metrics.conversionRate,
    entry.metrics.views7d,
    entry.priceTTC,
    entry.scheduledPublishAt,
    entry.scheduledUnpublishAt,
    entry.visibilityRules.minStock,
  ]);

  const visibilityChecks = [
    { ok: available > 0, label: `Stock disponible: ${available} > 0 -> Visible` },
    { ok: entry.productId.startsWith('PRD-'), label: 'Statut PIM: Actif' },
    { ok: entry.priceTTC > 0, label: `Prix: ${formatDZD(entry.priceTTC)} > 0` },
    { ok: entry.status !== 'draft', label: `Statut Catalogue: ${getCatalogueStatusMeta(entry.status).label}` },
    { ok: entry.status !== 'draft', label: `Brouillon OCR: ${entry.status === 'draft' ? 'Oui' : 'Non'}` },
    {
      ok: available > entry.visibilityRules.minStock,
      label: `Stock <= seuil (${available} <= ${entry.visibilityRules.minStock}) -> Badge Stock Limite actif`,
    },
    {
      ok: publishedVariantCount > 0,
      label: `Variantes disponibles: ${publishedVariantCount}/${variants.length || entry.variantCount} (${Math.max((variants.length || entry.variantCount) - publishedVariantCount, 0)} exclues auto - rupture)`,
    },
  ];

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 0.75, mb: 2, borderRadius: 999, borderColor: 'divider', overflowX: 'auto' }}>
        <Tabs
          value={tab}
          onChange={(_, value) => onTabChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 44, '& .MuiTabs-indicator': { display: 'none' } }}
        >
          {TABS.map((label, index) => (
            <Tab
              key={label}
              label={label}
              value={index}
              sx={{
                minHeight: 40,
                borderRadius: 999,
                textTransform: 'none',
                fontWeight: 700,
                '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff' },
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Stack spacing={2}>
          {channels.map((channel) => {
            const meta = getChannelMeta(channel.id);
            const Icon = meta.icon;
            const statusMeta = getCatalogueStatusMeta(channel.status === 'draft' ? 'draft' : channel.status);
            const enabled = channel.status !== 'draft';
            const infoLabel =
              channel.id === 'website'
                ? channel.indexed
                  ? 'Indexe OpenSearch'
                  : 'Indexation en attente'
                : channel.indexed
                  ? 'Image validee'
                  : 'Sync catalogue active';

            return (
              <Paper key={channel.id} variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: enabled ? '#9ae6b4' : '#30363d' }}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 44, height: 44, borderRadius: 999, bgcolor: meta.bg, color: meta.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={800}>{channel.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{channel.subtitle}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.8 }} flexWrap="wrap">
                          <Chip label={statusMeta.label} size="small" sx={{ bgcolor: statusMeta.bg, color: statusMeta.fg, fontWeight: 700 }} />
                          <Chip label={infoLabel} size="small" sx={{ bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main', fontWeight: 700 }} />
                        </Stack>
                      </Box>
                    </Stack>
                    <Switch checked={enabled} disabled={channelTogglePending} onChange={(_, checked) => onToggleChannel(channel.id, checked)} />
                  </Stack>

                  <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fbff' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
                      <Typography fontWeight={800} sx={{ color: 'primary.main' }}>
                        Position recherche: {channel.searchRank ? `#${channel.searchRank}` : 'Non classe'}
                      </Typography>
                      <Typography color="text.secondary">Mots-cles actifs: {channel.activeKeywords}</Typography>
                      <Typography color="text.secondary">Mis en avant: {channel.featuredPlacement}</Typography>
                    </Stack>
                    <Typography sx={{ mt: 1.5, fontWeight: 700, color: 'warning.main' }}>
                      {channel.id === 'website'
                        ? `Variantes publiees: ${publishedVariantCount}/${variants.length || entry.variantCount}`
                        : `Prix affiche: ${formatDZD(entry.priceTTC)} (TTC)`}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
                      {(variants.length > 0
                        ? variants
                        : Array.from({ length: entry.variantCount }).map((_, index) => ({
                            variantId: `${entry.id}-${index}`,
                            sku: `${entry.sku}-${index + 1}`,
                            attributes: { taille: `V${index + 1}` } as Record<string, string>,
                            priceTTC: entry.priceTTC,
                            stock: index === 0 ? available : 0,
                          }))
                      )
                        .slice(0, 5)
                        .map((variant) => {
                          const primaryLabel =
                            variant.attributes.taille ||
                            variant.attributes.couleur ||
                            Object.values(variant.attributes)[0] ||
                            variant.sku;
                          const inStock = (entry.availableStock ?? 0) > 0;
                          return (
                            <Chip
                              key={variant.variantId}
                              label={`${primaryLabel} ${inStock ? 'OK' : 'Rupture'}`}
                              size="small"
                              sx={{ bgcolor: inStock ? 'rgba(46,160,67,0.15)' : 'rgba(248,81,73,0.15)', color: inStock ? '#2ea043' : '#f85149', fontWeight: 700 }}
                            />
                          );
                        })}
                    </Stack>
                    <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                      {Math.max((variants.length || entry.variantCount) - publishedVariantCount, 0)} variantes exclues automatiquement (stock dispo = 0 {'→'} regle Inventory {'→'} Catalogue)
                    </Typography>
                  </Paper>

                  <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ borderRadius: 3 }}>
                    {channel.id === 'website'
                      ? `Prix TTC (${formatDZD(entry.priceTTC)}) verrouille en snapshot a la confirmation de commande COD. Modifications PIM prises en compte sur nouvelles commandes uniquement.`
                      : `Derniere sync il y a 47 min. Prochaine sync dans 13 min. Message de bienvenue actif pour ce canal.`}
                  </Alert>
                </Stack>
              </Paper>
            );
          })}

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderStyle: 'dashed', borderColor: 'divider', opacity: 0.55 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Marketplace (Jumia.dz)</Typography>
                <Typography variant="body2" color="text.secondary">Phase 3 - Q4 2026</Typography>
              </Box>
              <Switch checked={false} disabled />
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 4, borderColor: 'divider' }}>
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Parametres Produit</Typography>
            </Box>
            <Divider />
            <Stack sx={{ px: 2.5 }}>
              <ToggleRow checked={productSettings.homepageFeature} helper="" label="Mettre en avant (page d'accueil)" onChange={(checked) => setProductSettings((current) => ({ ...current, homepageFeature: checked }))} />
              <ToggleRow checked={productSettings.limitBadge} helper={`Actif: ${available} <= ${entry.visibilityRules.minStock}`} label="Badge Stock Limite" onChange={(checked) => setProductSettings((current) => ({ ...current, limitBadge: checked }))} />
              <ToggleRow checked={productSettings.autoPromo} helper="Phase 2" label="Promotion auto si campagne active" onChange={(checked) => setProductSettings((current) => ({ ...current, autoPromo: checked }))} />
              <ToggleRow checked={productSettings.sponsoredSearch} helper="" label="Inclure dans recherche sponsorisee" onChange={(checked) => setProductSettings((current) => ({ ...current, sponsoredSearch: checked }))} />
              <ToggleRow checked={productSettings.whatsappPriceRestriction} helper={`Ce produit: ${formatDZD(entry.priceTTC)} ${entry.priceTTC > 50000 ? '> 50 000' : '< 50 000'} -> ${entry.priceTTC > 50000 ? 'concerne' : 'non concerne'}`} label="Restriction WhatsApp si prix > 50 000 DZD" onChange={(checked) => setProductSettings((current) => ({ ...current, whatsappPriceRestriction: checked }))} />
            </Stack>
          </Paper>
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Alert
            severity="info"
            action={
              <Button color="inherit" size="small" variant="contained" onClick={onOpenInventory} sx={{ borderRadius: 999 }}>
                Ouvrir SKU dans Inventory
              </Button>
            }
            sx={{ borderRadius: 3 }}
          >
            Donnees en lecture seule - source Module Inventory (temps reel). Pour modifier le stock, utiliser le module Inventory.
          </Alert>

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Repartition du stock actuel</Typography>
            <Box sx={{ mt: 1.5, height: 32, borderRadius: 999, overflow: 'hidden', display: 'flex', bgcolor: 'action.hover' }}>
              <BarSegment color="#2ea043" label={`${available} Disponibles`} total={totalUnits} value={available} />
              <BarSegment color="#bc8cff" label={`${soft} Soft`} total={totalUnits} value={soft} />
              <BarSegment color="#58a6ff" label={`${hard} Hard`} total={totalUnits} value={hard} />
              <BarSegment color="#d29922" label={`${quarantine} Quarantaine`} total={totalUnits} value={quarantine} />
            </Box>

            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <Stack spacing={0.75}>
                  <LegendDot color="#2ea043" label={`Disponible: ${available} -> Catalogue visible`} />
                  <LegendDot color="#58a6ff" label={`Hard (WMS prep): ${hard} -> Deduit de la dispo`} />
                  <LegendDot color="#58a6ff" label="En transit: 0 -> Non dans dispo actuelle" />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={0.75}>
                  <LegendDot color="#bc8cff" label={`Soft (non confirmees): ${soft} -> Deduit de la dispo`} />
                  <LegendDot color="#d29922" label={`Quarantaine (retours): ${quarantine} -> Jamais dans dispo`} />
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, p: 1.5, borderRadius: 3, bgcolor: 'rgba(188,140,255,0.15)', color: '#bc8cff' }}>
              <Typography fontWeight={700}>
                {soft} reservations Soft expirent apres 120 minutes (heures ouvrables). A l&apos;expiration: commande annulee, reservation liberee, stock disponible augmente.
              </Typography>
            </Box>
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 3, bgcolor: 'rgba(46,160,67,0.15)', color: 'success.main' }}>
              <Typography fontWeight={700}>
                Stock dispo ({available}) {'>'} 0 {'→'} Produit visible sur {entry.channelCount} canaux. Si dispo tombe a 0 {'→'} masquage automatique instantane sur tous les canaux.
              </Typography>
            </Box>
          </Paper>

          <Grid container spacing={2}>
            {(inventory?.warehouseBreakdown ?? []).map((warehouse) => (
              <Grid item xs={12} md={4} key={warehouse.warehouseId}>
                <Paper variant="outlined" sx={{ borderRadius: 4, p: 2, borderColor: warehouse.isPrimary ? '#fbbf24' : '#30363d' }}>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <LocationOnOutlinedIcon sx={{ fontSize: 16, color: warehouse.isPrimary ? '#d29922' : '#8b949e' }} />
                    <Typography fontWeight={800}>{warehouse.warehouseName}{warehouse.isPrimary ? ' - Principal' : ''}</Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1.5, color: warehouse.available > 0 ? '#fd8c73' : '#8b949e' }}>
                    Dispo: {warehouse.available}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Soft: {warehouse.soft}  Hard: {warehouse.hard}</Typography>
                  <Typography variant="body2" color="text.secondary">Total: {warehouse.total}  Seuil: {inventory?.reorderPoint ?? 0}</Typography>
                  <Box sx={{ mt: 1.5, height: 6, borderRadius: 999, bgcolor: 'rgba(88,166,255,0.15)', overflow: 'hidden' }}>
                    <Box sx={{ width: `${Math.min((warehouse.available / Math.max(warehouse.total || 1, 1)) * 100, 100)}%`, height: '100%', bgcolor: 'primary.main' }} />
                  </Box>
                  {warehouse.available <= (inventory?.reorderPoint ?? 0) && (
                    <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                      Seuil atteint depuis 2 jours
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Valorisation FIFO <LockOutlinedIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 1.5 }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                Cout FIFO (derniere couche): {formatDZD(inventory?.costFifo ?? 0)}/u
              </Typography>
              <Typography sx={{ fontFamily: 'monospace' }}>Cout moyen pondere: {formatDZD(weightedAverageCost)}/u</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>Valeur stock disponible: {formatDZD(availableValue)}</Typography>
              <Typography sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>Valeur totale (avec reservations): {formatDZD(stockValue)}</Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ color: 'success.main', fontWeight: 800, fontFamily: 'monospace' }}>
              Marge FIFO: {formatDZD(margin)} ({formatPercent(marginRate, 1)})
            </Typography>
            <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 3, bgcolor: 'rgba(88,166,255,0.15)', color: 'text.secondary' }}>
              <Typography variant="body2">Methode FIFO obligatoire - Architecture FERZA v2.0 - Conforme Banque d&apos;Algerie - Source: Module Inventory (couches FIFO)</Typography>
            </Box>
          </Paper>

          {available <= (inventory?.reorderPoint ?? 0) && (
            <Alert severity="warning" icon={<WarningAmberOutlinedIcon />} sx={{ borderRadius: 4 }}>
              Stock sous seuil depuis 2 jours (seuil {inventory?.reorderPoint ?? 0}, actuel {available}). Fournisseur: {entry.product?.supplierName ?? 'FERZA'} - Delai: 7 jours - Qte suggeree: {inventory?.suggestedReorderQty ?? 0} unites.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Disponibilite par wilaya</Typography>
            <Typography sx={{ mt: 1, fontWeight: 800, color: 'warning.main' }}>
              {entry.visibilityRules.allowedWilayasCount} / 48 wilayas disponibles
            </Typography>
            {entry.visibilityRules.hiddenWilayas.length > 0 ? (
              <>
                <Typography variant="body2" sx={{ mt: 1, color: 'error.main', fontWeight: 700 }}>
                  Restreintes ({entry.visibilityRules.hiddenWilayas.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.8 }}>
                  {entry.visibilityRules.hiddenWilayas.map((wilaya) => (
                    <Chip key={wilaya} label={`${wilaya} - Zone non couverte`} size="small" sx={{ bgcolor: 'rgba(248,81,73,0.15)', color: 'error.main' }} />
                  ))}
                </Stack>
              </>
            ) : (
              <Chip label="Aucune restriction wilaya" sx={{ mt: 1, bgcolor: 'rgba(46,160,67,0.15)', color: 'success.main' }} />
            )}
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Diagnostic Visibilite</Typography>
            <Stack spacing={1.1} sx={{ mt: 1.5 }}>
              {visibilityChecks.map((item) => (
                <Stack key={item.label} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 18, height: 18, borderRadius: 999, bgcolor: item.ok ? 'rgba(46,160,67,0.15)' : 'rgba(253,140,115,0.08)', color: item.ok ? '#2ea043' : '#d29922', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                    {item.ok ? '✓' : '!'}
                  </Box>
                  <Typography sx={{ color: item.ok ? '#c9d1d9' : '#d29922' }}>{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 3, bgcolor: 'rgba(46,160,67,0.15)', color: 'success.main' }}>
              <Typography fontWeight={800}>
                VISIBLE sur {entry.channelCount} canaux - Badges actifs: {productSettings.limitBadge ? 'Stock Limite' : 'Aucun'} {entry.metrics.conversionRate >= 0.04 ? '+ Top Vendeur' : ''}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Type de Planification</Typography>
            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={4}>
                <ModeCard active={planningMode === 'immediate'} icon={<BoltOutlinedIcon />} subtitle="Publier / Depublier maintenant" title="Immediatement" onClick={() => setPlanningMode('immediate')} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ModeCard active={planningMode === 'schedule'} icon={<CalendarMonthOutlinedIcon />} subtitle="Choisir date et heure" title="Planifier" onClick={() => setPlanningMode('schedule')} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ModeCard active={planningMode === 'auto-unpublish'} icon={<EventBusyOutlinedIcon />} subtitle="Retrait automatique" title="Depublication auto" onClick={() => setPlanningMode('auto-unpublish')} />
              </Grid>
            </Grid>
          </Paper>

          {planningMode === 'immediate' && (
            <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800}>Actions immediates</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Statut actuel: {getCatalogueStatusMeta(entry.status).label}. Les actions ci-dessous utilisent directement les mocks catalogue.
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={onPublishNow} disabled={actionPending} sx={{ borderRadius: 999 }}>Publier maintenant</Button>
                <Button variant="outlined" color="warning" onClick={onMaskNow} disabled={actionPending} sx={{ borderRadius: 999 }}>Masquer maintenant</Button>
                <Button variant="outlined" color="error" onClick={onUnpublishNow} disabled={actionPending} sx={{ borderRadius: 999 }}>Depublier</Button>
              </Stack>
            </Paper>
          )}

          {planningMode === 'schedule' && (
            <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800}>Planifier la publication</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                La publication basculera le produit au statut planifie puis l&apos;historique mock sera mis a jour.
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="datetime-local" label="Date et heure de publication" value={publishAt} onChange={(event) => setPublishAt(event.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fbff', height: '100%' }}>
                    <Typography fontWeight={700}>Canaux cibles</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {channels.filter((channel) => channel.status !== 'draft').map((channel) => channel.label).join(' + ') || 'Site Web par defaut'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ mt: 2 }}>
                <Button variant="contained" disabled={!publishAt || actionPending} onClick={() => publishAt && onSchedulePublication(new Date(publishAt).toISOString())} sx={{ borderRadius: 999 }}>
                  Enregistrer la planification
                </Button>
                {entry.scheduledPublishAt && <Chip label={`Actuelle: ${new Date(entry.scheduledPublishAt).toLocaleString('fr-DZ')}`} />}
              </Stack>
            </Paper>
          )}

          {planningMode === 'auto-unpublish' && (
            <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={800}>Planifier la depublication automatique</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Utilisez ce mode pour retirer automatiquement le produit apres une campagne ou une periode de disponibilite limitee.
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="datetime-local" label="Date et heure de retrait" value={unpublishAt} onChange={(event) => setUnpublishAt(event.target.value)} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(253,140,115,0.08)', height: '100%' }}>
                    <Typography fontWeight={700} color="warning.main">Retrait recommande</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      Ideal pour fins de campagne, editions limitees ou produits sensibles au stock.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ mt: 2 }}>
                <Button variant="contained" color="warning" disabled={!unpublishAt || actionPending} onClick={() => unpublishAt && onScheduleUnpublish(new Date(unpublishAt).toISOString())} sx={{ borderRadius: 999 }}>
                  Enregistrer le retrait auto
                </Button>
                {entry.scheduledUnpublishAt && <Chip label={`Actuelle: ${new Date(entry.scheduledUnpublishAt).toLocaleString('fr-DZ')}`} />}
              </Stack>
            </Paper>
          )}
        </Stack>
      )}

      {tab === 3 && (
        <VisibilityRulesTab entry={entry} />
      )}

      {tab === 4 && <PublicationHistoryTab entry={entry} />}
    </Box>
  );
}

function ToggleRow({
  checked,
  helper,
  label,
  onChange,
}: {
  checked: boolean;
  helper: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ py: 1.6, borderBottom: '1px solid #eef2f7', '&:last-of-type': { borderBottom: 'none' } }}>
      <Box>
        <Typography fontWeight={600}>{label}</Typography>
        {helper ? <Typography variant="caption" sx={{ color: checked ? '#2ea043' : '#8b949e', display: 'block', mt: 0.3 }}>{helper}</Typography> : null}
      </Box>
      <Switch checked={checked} onChange={(_, value) => onChange(value)} />
    </Stack>
  );
}

function BarSegment({
  color,
  label,
  total,
  value,
}: {
  color: string;
  label: string;
  total: number;
  value: number;
}) {
  if (value <= 0) return null;

  return (
    <Box
      sx={{
        width: `${(value / total) * 100}%`,
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
        fontSize: 12,
        minWidth: 0,
      }}
    >
      {label}
    </Box>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: 999, bgcolor: color }} />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Stack>
  );
}

function ModeCard({
  active,
  icon,
  onClick,
  subtitle,
  title,
}: {
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <Paper
      onClick={onClick}
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: 'pointer',
        borderColor: active ? '#58a6ff' : '#30363d',
        bgcolor: active ? 'rgba(88,166,255,0.15)' : '#fff',
        boxShadow: active ? '0 10px 24px rgba(37, 99, 235, 0.12)' : 'none',
      }}
    >
      <Box sx={{ color: active ? '#58a6ff' : '#8b949e' }}>{icon}</Box>
      <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>{title}</Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Paper>
  );
}

function toLocalDateTime(value: string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 16);
}
