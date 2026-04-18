'use client';

import { startTransition, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import SKUDetailHeader from '@/modules/inventory/components/detail/SKUDetailHeader';
import SKUDetailTabs from '@/modules/inventory/components/detail/SKUDetailTabs';
import StockMovementModal, {
  type InventoryMovementMode,
} from '@/modules/inventory/components/modals/StockMovementModal';
import { useFifoCosts } from '@/modules/inventory/hooks/useFifoCosts';
import { useInventorySKU } from '@/modules/inventory/hooks/useInventorySKU';
import { useProcessReturn } from '@/modules/inventory/hooks/useProcessReturn';
import { useStockMovements } from '@/modules/inventory/hooks/useStockMovements';
import { useCreateMovement } from '@/modules/inventory/hooks/useCreateMovement';
import type {
  InventoryFifoLayer,
  InventoryMovement,
} from '@/modules/inventory/inventory.types';
import {
  formatDZD,
  getMovementMeta,
  relativeTime,
} from '@/modules/inventory/inventory.ui';

const TAB_KEYS = ['overview', 'reservations', 'movements', 'fifo', 'returns'] as const;

type InventoryTabKey = (typeof TAB_KEYS)[number];

const TAB_INDEX_BY_KEY: Record<InventoryTabKey, number> = {
  overview: 0,
  reservations: 1,
  movements: 2,
  fifo: 3,
  returns: 4,
};

const tabFromQuery = (value: string | null) => {
  if (!value) return 0;
  if (value in TAB_INDEX_BY_KEY) {
    return TAB_INDEX_BY_KEY[value as InventoryTabKey];
  }
  return 0;
};

const keyFromTab = (index: number): InventoryTabKey => TAB_KEYS[index] ?? 'overview';

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'fr';
  const sku = typeof params.sku === 'string' ? params.sku : '';
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(() => tabFromQuery(tabParam));
  const [toast, setToast] = useState('');
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementMode, setMovementMode] = useState<InventoryMovementMode>('receipt');
  const [processingReturnId, setProcessingReturnId] = useState<string | null>(null);

  const detailQuery = useInventorySKU(sku);
  const movementsQuery = useStockMovements(sku);
  const fifoQuery = useFifoCosts(sku);
  const createMovement = useCreateMovement();
  const processReturnMutation = useProcessReturn();

  const item = detailQuery.data?.data;

  useEffect(() => {
    setActiveTab(tabFromQuery(tabParam));
  }, [tabParam]);

  const movements = useMemo<InventoryMovement[]>(
    () => movementsQuery.data?.data ?? item?.movements ?? [],
    [item?.movements, movementsQuery.data?.data],
  );

  const fifoLayers = useMemo<InventoryFifoLayer[]>(
    () => (fifoQuery.data?.data as InventoryFifoLayer[] | undefined) ?? item?.fifoLayers ?? [],
    [fifoQuery.data?.data, item?.fifoLayers],
  );

  const journalEntries = useMemo(
    () =>
      [...movements]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 5),
    [movements],
  );

  const activeFifoLayers = useMemo(
    () => fifoLayers.filter((layer) => layer.quantityRemaining > 0),
    [fifoLayers],
  );

  const currentFifoValue = useMemo(
    () =>
      activeFifoLayers.reduce(
        (total, layer) => total + layer.quantityRemaining * layer.unitCostHT,
        0,
      ),
    [activeFifoLayers],
  );

  const handleTabChange = (nextTab: number) => {
    setActiveTab(nextTab);
    startTransition(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const nextKey = keyFromTab(nextTab);

      if (nextKey === 'overview') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', nextKey);
      }

      const suffix = nextParams.toString();
      router.replace(`/${locale}/inventory/${sku}${suffix ? `?${suffix}` : ''}`);
    });
  };

  const openMovement = (mode: InventoryMovementMode) => {
    setMovementMode(mode);
    setMovementOpen(true);
  };

  const handleProcessReturn = async (
    returnId: string,
    decision: 'approve' | 'reject',
  ) => {
    if (!item) return;

    setProcessingReturnId(returnId);
    try {
      await processReturnMutation.mutateAsync({
        sku: item.sku,
        returnId,
        decision,
      });
      setToast(
        decision === 'approve'
          ? 'Retour approuve et reintegre en stock.'
          : 'Retour rejete et sorti du stock.',
      );
    } finally {
      setProcessingReturnId(null);
    }
  };

  if (detailQuery.isLoading) {
    return (
      <Box
        sx={{
          p: 5,
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100%' }}>
        <Paper
          variant="outlined"
          sx={{ borderRadius: 4, borderColor: '#f85149', bgcolor: 'background.paper', p: 3 }}
        >
          <Typography color="error" fontWeight={800}>
            SKU introuvable.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100%' }}>
      <SKUDetailHeader
        item={item}
        locale={locale}
        onHistory={() => handleTabChange(TAB_INDEX_BY_KEY.movements)}
        onMove={() => openMovement('sale')}
        onReceive={() => openMovement('receipt')}
      />

      {item.quantityAvailable <= item.reorderPoint ? (
        <Paper
          variant="outlined"
          sx={{
            mb: 2.25,
            borderRadius: 4,
            borderColor: '#d29922',
            bgcolor: 'rgba(210,153,34,0.12)',
            px: 2,
            py: 1.5,
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ lg: 'center' }}
          >
            <Stack direction="row" spacing={1.1} alignItems="center">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  bgcolor: 'rgba(210,153,34,0.15)',
                  color: 'warning.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ color: 'warning.main', fontWeight: 800 }}>
                  Stock sous le seuil de reapprovisionnement
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Dispo {item.quantityAvailable} / Seuil {item.reorderPoint} / Suggestion: {item.suggestedReorderQty} unites
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Disponible apres implementation du module Bon de Commande">
              <span>
                <Button
                  variant="outlined"
                  disabled
                  sx={{ borderRadius: 999, borderColor: '#d29922', color: 'warning.main' }}
                >
                  Creer Bon de Commande
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 332px' },
          alignItems: 'start',
        }}
      >
        <SKUDetailTabs
          item={item}
          movements={movements}
          fifoLayers={fifoLayers}
          tab={activeTab}
          onTabChange={handleTabChange}
          onAction={(message) => setToast(message)}
          onApproveReturn={(returnId) => handleProcessReturn(returnId, 'approve')}
          onRejectReturn={(returnId) => handleProcessReturn(returnId, 'reject')}
          processingReturnId={processingReturnId}
        />

        <Stack spacing={2} sx={{ position: { lg: 'sticky' }, top: { lg: 18 } }}>
          <SidebarCard title="Stock Actuel" actionLabel="Historique" onAction={() => handleTabChange(2)}>
            <Typography variant="h3" fontWeight={800} sx={{ color: 'success.main', textAlign: 'center' }}>
              {item.quantityAvailable}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              unites disponibles (soft)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
              + {item.softReserved + item.hardReserved} reservees ({item.softReserved}S + {item.hardReserved}H)
            </Typography>
            <StockBar
              available={item.quantityAvailable}
              hard={item.hardReserved}
              quarantine={item.quantityQuarantined}
              soft={item.softReserved}
              total={Math.max(item.quantityOnHand, 1)}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Seuil reappro: {item.reorderPoint} unites
            </Typography>
            <Divider sx={{ my: 1.1 }} />
            <Stack spacing={0.85}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Inventory2OutlinedIcon />}
                onClick={() => openMovement('receipt')}
                sx={{ borderRadius: 2.2, minHeight: 34 }}
              >
                Receptionner Stock
              </Button>
            </Stack>
          </SidebarCard>

          <SidebarCard title="Valorisation FIFO" actionLabel="Voir couches" onAction={() => handleTabChange(3)}>
            <SidebarMetric label="Derniere couche" value={`${item.costFifo.toLocaleString('fr-DZ')} DZD/u`} />
            <SidebarMetric
              label="Cout moyen pondere"
              value={`${item.weightedAverageCost.toLocaleString('fr-DZ')} DZD/u`}
            />
            <SidebarMetric label="Valeur stock" value={formatDZD(item.stockValue)} />
            <SidebarMetric label="Valeur disponible" value={formatDZD(item.availableValue)} />
            <Divider sx={{ my: 1.25 }} />
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
              {activeFifoLayers.length} couches actives - valeur FIFO {formatDZD(currentFifoValue)}
            </Typography>
          </SidebarCard>

          <SidebarCard title="Reapprovisionnement">
            <Stack spacing={0.85}>
              <SidebarMetric label="Seuil d'alerte" value={`${item.reorderPoint} unites`} />
              <SidebarMetric label="Qte suggeree" value={`${item.suggestedReorderQty} unites`} />
              <SidebarMetric label="Fournisseur" value={item.supplierName} />
              <Divider sx={{ my: 0.8 }} />
              <Tooltip title="Disponible apres implementation du module Bon de Commande">
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    disabled
                    startIcon={<NoteAddOutlinedIcon />}
                    sx={{ borderRadius: 2.2, minHeight: 34 }}
                  >
                    Creer Bon de Commande
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </SidebarCard>

          <SidebarCard
            title="Journal d'Audit"
            titleRight={<Chip size="small" label="Immuable" sx={{ bgcolor: 'rgba(139,148,158,0.15)', color: 'text.secondary', border: '1px solid', borderColor: 'divider' }} />}
            actionLabel="Voir tout"
            onAction={() => handleTabChange(2)}
          >
            <Stack spacing={1.15}>
              {journalEntries.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucun mouvement enregistre.
                </Typography>
              ) : (
                journalEntries.map((entry) => {
                  const meta = getMovementMeta(entry.type);
                  return (
                    <Stack key={entry.id} direction="row" spacing={1.1} alignItems="flex-start">
                      <Box
                        sx={{
                          mt: 0.35,
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          bgcolor: meta.color,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                          {entry.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {relativeTime(entry.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })
              )}
              <Button
                size="small"
                variant="text"
                startIcon={<HistoryOutlinedIcon />}
                onClick={() => handleTabChange(2)}
                sx={{ alignSelf: 'flex-start', px: 0, minWidth: 'auto' }}
              >
                Voir historique complet
              </Button>
            </Stack>
          </SidebarCard>
        </Stack>
      </Box>

      <StockMovementModal
        open={movementOpen}
        items={[item]}
        catalog={[item]}
        initialMode={movementMode}
        onClose={() => setMovementOpen(false)}
        onSubmit={async (payload) => {
          await createMovement.mutateAsync(payload);
          setToast('Mouvement enregistre.');
        }}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2600}
        onClose={() => setToast('')}
        message={toast}
      />
    </Box>
  );
}

function SidebarCard({
  actionLabel,
  children,
  onAction,
  title,
  titleRight,
}: {
  actionLabel?: string;
  children: ReactNode;
  onAction?: () => void;
  title: string;
  titleRight?: ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 4, borderColor: 'divider', bgcolor: 'background.paper', p: 2.1 }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary' }}>
          {title}
        </Typography>
        {titleRight ? (
          titleRight
        ) : actionLabel && onAction ? (
          <Button onClick={onAction} size="small" sx={{ borderRadius: 999 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
      {children}
    </Paper>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary', textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function StockBar({
  available,
  hard,
  quarantine,
  soft,
  total,
}: {
  available: number;
  hard: number;
  quarantine: number;
  soft: number;
  total: number;
}) {
  const segments = [
    { color: 'success.main', value: available },
    { color: '#bc8cff', value: soft },
    { color: 'primary.main', value: hard },
    { color: 'warning.main', value: quarantine },
  ].filter((segment) => segment.value > 0);

  return (
    <Stack spacing={0.9} sx={{ my: 1.35 }}>
      <Stack
        direction="row"
        sx={{ height: 14, borderRadius: 999, overflow: 'hidden', bgcolor: 'action.hover' }}
      >
        {segments.map((segment) => (
          <Box
            key={`${segment.color}-${segment.value}`}
            sx={{ width: `${(segment.value / total) * 100}%`, bgcolor: segment.color }}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1.2} flexWrap="wrap">
        <MiniLegend color="#2ea043" label={`${available} dispo`} />
        <MiniLegend color="#bc8cff" label={`${soft} soft`} />
        <MiniLegend color="#58a6ff" label={`${hard} hard`} />
        <MiniLegend color="#d29922" label={`${quarantine} quarantaine`} />
      </Stack>
    </Stack>
  );
}

function MiniLegend({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.6} alignItems="center">
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: 999,
          bgcolor: color,
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Stack>
  );
}
