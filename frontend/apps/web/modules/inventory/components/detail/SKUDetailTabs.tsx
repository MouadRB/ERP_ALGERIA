'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  TextField,
  Tabs,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type {
  InventoryFifoLayer,
  InventoryItem,
  InventoryMovement,
  InventoryReturn,
} from '../../inventory.types';
import { formatDZD, getMovementMeta, relativeTime } from '../../inventory.ui';

type SKUDetailTabsProps = {
  fifoLayers: InventoryFifoLayer[];
  item: InventoryItem;
  movements: InventoryMovement[];
  onAction: (message: string) => void;
  onApproveReturn: (returnId: string) => Promise<void>;
  onRejectReturn: (returnId: string) => Promise<void>;
  processingReturnId?: string | null;
  tab: number;
  onTabChange: (tab: number) => void;
};

const TABS = [
  'Vue d Ensemble',
  'Reservations',
  'Mouvements',
  'FIFO - Couches de Stock',
  'Retours',
];

const RETURNS_GRID_COLUMNS = '120px 150px 130px 250px 140px 140px 220px';

export default function SKUDetailTabs({
  fifoLayers,
  item,
  movements,
  onAction,
  onApproveReturn,
  onRejectReturn,
  processingReturnId = null,
  onTabChange,
  tab,
}: SKUDetailTabsProps) {
  const available = item.quantityAvailable;
  const soft = item.softReserved;
  const hard = item.hardReserved;
  const total = Math.max(item.quantityOnHand, 1);
  const stockSegments = [
    { color: 'success.main', label: `${available} Disponibles`, value: available },
    { color: '#bc8cff', label: `${soft} Soft`, value: soft },
    { color: 'primary.main', label: `${hard} Hard`, value: hard },
  ].filter((segment) => segment.value > 0);

  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [movementVisibleCount, setMovementVisibleCount] = useState(10);

  const sortedMovements = useMemo(
    () =>
      [...movements].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    [movements],
  );

  const filteredMovements = useMemo(
    () =>
      sortedMovements.filter((movement) =>
        matchesMovementFilter(movement.type, movementTypeFilter),
      ),
    [sortedMovements, movementTypeFilter],
  );

  const displayedMovements = useMemo(
    () => filteredMovements.slice(0, movementVisibleCount),
    [filteredMovements, movementVisibleCount],
  );

  useEffect(() => {
    setMovementVisibleCount(10);
  }, [item.sku, movementTypeFilter]);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, value) => onTabChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTab-root': {
            minHeight: 34,
            minWidth: 'auto',
            px: 1.5,
            py: 0.75,
            borderRadius: 999,
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'none',
          },
          '& .Mui-selected': {
            bgcolor: 'primary.main',
            color: '#fff !important',
          },
        }}
      >
        {TABS.map((label, index) => (
          <Tab
            key={label}
            label={
              index === 1
                ? `${label} (${item.reservations.length})`
                : index === 2
                  ? `${label} (${sortedMovements.length})`
                  : index === 4
                    ? `${label} (${item.returns.length})`
                    : label
            }
          />
        ))}
      </Tabs>

      {tab === 0 ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              Detail des stocks
            </Typography>
            {stockSegments.length > 0 ? (
              <Stack direction="row" sx={{ mt: 1.2, height: 28, borderRadius: 999, overflow: 'hidden', bgcolor: 'action.hover' }}>
                {stockSegments.map((segment) => (
                  <Box key={segment.label} sx={{ width: `${(segment.value / total) * 100}%`, bgcolor: segment.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 800 }}>
                      {segment.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : null}
            <Stack spacing={0.7} sx={{ mt: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'success.main' }}>
                Stock disponible (soft): {available} unites - peut etre vendu maintenant
              </Typography>
              <Typography variant="body2" sx={{ color: '#bc8cff' }}>
                Soft reserve: {soft} unites - commandes en attente de validation
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main' }}>
                Stock reserve (hard): {hard} unites - confirmees, en preparation WMS
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1.4, fontWeight: 700 }}>
              Valeur disponible: {formatDZD(item.availableValue)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Valeur totale (avec reservations): {formatDZD(item.quantityOnHand * item.costFifo)}
            </Typography>
            <Paper variant="outlined" sx={{ mt: 1.5, borderRadius: 3, px: 1.3, py: 1.1, bgcolor: 'rgba(88,166,255,0.15)', borderColor: '#58a6ff' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoOutlinedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Le stock &quot;hard&quot; est reserve par les commandes confirmees dans OMS et n&apos;est plus disponible a la vente.
                </Typography>
              </Stack>
            </Paper>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              Reservations actives ({item.reservations.length})
            </Typography>
            <Stack spacing={0.6} sx={{ mt: 1 }}>
              {item.reservations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucune reservation active.
                </Typography>
              ) : (
                item.reservations.slice(0, 5).map((reservation) => (
                  <Stack key={reservation.reservationId} direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2">
                      #{reservation.orderId} - {reservation.quantity} unite{reservation.quantity > 1 ? 's' : ''}
                    </Typography>
                    <Chip
                      size="small"
                      label={reservation.type === 'soft' ? 'Soft' : 'Hard'}
                      sx={{
                        bgcolor: reservation.type === 'soft' ? 'rgba(188,140,255,0.15)' : 'rgba(88,166,255,0.15)',
                        color: reservation.type === 'soft' ? '#bc8cff' : '#58a6ff',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                ))
              )}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              Alertes actives
            </Typography>
            <Stack spacing={1.2} sx={{ mt: 1 }}>
              {available <= item.reorderPoint ? (
                <AlertStrip
                  tone="danger"
                  text={`Stock disponible (${available}) sous le seuil de reapprovisionnement (${item.reorderPoint}). Quantite suggeree: ${item.suggestedReorderQty} unites - Fournisseur: ${item.supplierName}`}
                />
              ) : null}
              {soft > 0 ? (
                <AlertStrip
                  tone="warning"
                  text={`${soft} unite${soft > 1 ? 's' : ''} en reservation soft (commandes non confirmees).`}
                />
              ) : null}
              {available > item.reorderPoint && soft === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucune alerte active.
                </Typography>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      ) : null}

      {tab === 1 ? (
        <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>Reservations Actives</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.reservations.length} reservations - {soft} Soft - {hard} Hard
            </Typography>
          </Stack>

          <Paper variant="outlined" sx={{ mt: 1.5, borderRadius: 3, px: 1.3, py: 1.1, bgcolor: 'rgba(88,166,255,0.15)', borderColor: '#58a6ff' }}>
            <Typography variant="body2" color="text.secondary">
              Les reservations sont liees au systeme OMS. Soft: commande placee - Hard: commande confirmee. La liberation est automatique a l&apos;annulation ou a l&apos;expedition.
            </Typography>
          </Paper>

          <TableShell
            header={['Commande', 'Client', 'Type', 'Quantite', 'Statut OMS', 'Creee', 'Action']}
            sx={{ mt: 1.5 }}
          >
            {item.reservations.length === 0 ? (
              <Box sx={{ px: 1.4, py: 2.5 }}>
                <Typography color="text.secondary">Aucune reservation active.</Typography>
              </Box>
            ) : (
              item.reservations.map((reservation) => (
                <RowShell
                  key={reservation.reservationId}
                  cells={[
                    <Typography key="order" sx={{ color: 'primary.main', fontWeight: 800 }}>#{reservation.orderId.replace('CMD-', '')}</Typography>,
                    <Box key="client">
                      <Typography variant="body2">{reservation.clientPhone}</Typography>
                      <Typography variant="caption" color="text.secondary">{reservation.city}</Typography>
                    </Box>,
                    <Chip key="type" label={reservation.type === 'soft' ? 'Soft' : 'Hard'} size="small" sx={{ bgcolor: reservation.type === 'soft' ? 'rgba(188,140,255,0.15)' : 'rgba(88,166,255,0.15)', color: reservation.type === 'soft' ? '#bc8cff' : '#58a6ff', fontWeight: 700 }} />,
                    <Typography key="qty" variant="body2">{reservation.quantity} unite</Typography>,
                    <Chip key="status" label={reservation.statusOms || 'Confirmed'} size="small" sx={{ bgcolor: reservation.type === 'soft' ? 'rgba(210,153,34,0.15)' : 'rgba(46,160,67,0.15)', color: reservation.type === 'soft' ? '#d29922' : '#2ea043' }} />,
                    <Typography key="created" variant="body2">{relativeTime(reservation.reservedAt)}</Typography>,
                    <Button key="action" size="small" variant="outlined" sx={{ borderRadius: 999 }} onClick={() => onAction(`Ouverture ${reservation.actionLabel || 'commande'}.`)}>{reservation.actionLabel || 'Voir'}</Button>,
                  ]}
                />
              ))
            )}
          </TableShell>
        </Paper>
      ) : null}

      {tab === 2 ? (
        <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
            <Typography variant="h6" fontWeight={800}>
              Historique des Mouvements ({sortedMovements.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                size="small"
                value={movementTypeFilter}
                onChange={(event) => setMovementTypeFilter(event.target.value)}
                sx={{ minWidth: 124, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.default' } }}
              >
                <MenuItem value="all">Tous types</MenuItem>
                <MenuItem value="receipt">Receptions</MenuItem>
                <MenuItem value="sale">Sorties</MenuItem>
                <MenuItem value="return">Retours</MenuItem>
                <MenuItem value="quarantine">Quarantaine</MenuItem>
                <MenuItem value="physicalInventory">Inventaire physique</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          <Box sx={{ mt: 1.2, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
            {displayedMovements.length === 0 ? (
              <Typography sx={{ py: 3 }} color="text.secondary">
                Aucun mouvement pour le filtre selectionne.
              </Typography>
            ) : (
              displayedMovements.map((movement) => {
                const meta = getMovementMeta(movement.type);
                const Icon = meta.icon;
                const badge = `${movement.quantity > 0 ? '+' : ''}${movement.quantity}`;

                return (
                  <Stack
                    key={movement.id}
                    direction="row"
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ py: 1.35, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
                  >
                    <Stack direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: 999, bgcolor: meta.soft, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon sx={{ fontSize: 16 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800}>{movement.description}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {movement.referenceId || 'Sans reference'} - {Math.abs(movement.quantity)} unite{Math.abs(movement.quantity) > 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                          {meta.label}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Chip label={badge} size="small" sx={{ bgcolor: meta.soft, color: meta.color, fontWeight: 800 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                        {movement.performedBy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {relativeTime(movement.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })
            )}
          </Box>

          {movementVisibleCount < filteredMovements.length ? (
            <Button
              sx={{ mt: 1.5 }}
              onClick={() =>
                setMovementVisibleCount((current) =>
                  Math.min(current + 20, filteredMovements.length),
                )
              }
            >
              Voir plus de mouvements {'→'}
            </Button>
          ) : null}
        </Paper>
      ) : null}

      {tab === 3 ? (
        <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, px: 1.3, py: 1.1, bgcolor: 'rgba(88,166,255,0.15)', borderColor: '#58a6ff' }}>
            <Typography variant="body2" color="text.secondary">
              La methode FIFO (First In, First Out) est obligatoire pour la valorisation des stocks FERZA. Les couches les plus anciennes sont consommees en premier.
            </Typography>
          </Paper>

          <Typography variant="overline" sx={{ mt: 1.8, display: 'block', color: 'text.secondary', fontWeight: 800 }}>
            Couches FIFO actives
          </Typography>

          <Box sx={{ mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 1060 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '70px 150px 120px 190px 130px 150px 130px',
                    px: 1.4,
                    py: 1.15,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    fontSize: 12,
                    fontWeight: 800,
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  <Box># Couche</Box>
                  <Box>Date reception</Box>
                  <Box>Qte initiale</Box>
                  <Box>Restant</Box>
                  <Box>Cout unitaire</Box>
                  <Box>Valeur restante</Box>
                  <Box>Statut</Box>
                </Box>

                {fifoLayers.length === 0 ? (
                  <Box sx={{ px: 1.4, py: 2.5 }}>
                    <Typography color="text.secondary">Aucune couche FIFO active.</Typography>
                  </Box>
                ) : (
                  fifoLayers.map((layer, index) => {
                    const ratio = layer.quantityInitial > 0 ? (layer.quantityRemaining / layer.quantityInitial) * 100 : 0;
                    return (
                      <Box
                        key={layer.layerId}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '70px 150px 120px 190px 130px 150px 130px',
                          px: 1.4,
                          py: 1.2,
                          alignItems: 'center',
                          borderTop: (t) => `1px solid ${t.palette.divider}`,
                        }}
                      >
                        <Typography fontWeight={800}>#{index + 1}</Typography>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2">{new Date(layer.receivedAt).toLocaleDateString('fr-DZ')}</Typography>
                          {index === 0 ? (
                            <Chip
                              label="Premier consomme"
                              size="small"
                              sx={{ mt: 0.4, bgcolor: 'rgba(46,160,67,0.15)', color: 'success.main' }}
                            />
                          ) : null}
                        </Box>
                        <Typography variant="body2" noWrap>{layer.quantityInitial} unites</Typography>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }} noWrap>
                            {layer.quantityRemaining} restantes
                          </Typography>
                          <LinearProgress variant="determinate" value={ratio} sx={{ mt: 0.5, height: 6, borderRadius: 999 }} />
                        </Box>
                        <Typography variant="body2" noWrap>{formatDZD(layer.unitCostHT)}</Typography>
                        <Typography variant="body2" noWrap>{formatDZD(layer.quantityRemaining * layer.unitCostHT)}</Typography>
                        <Chip
                          label={layer.quantityRemaining > 0 ? 'Active' : 'Epuisee'}
                          size="small"
                          sx={{
                            width: 'fit-content',
                            bgcolor: layer.quantityRemaining > 0 ? 'rgba(46,160,67,0.15)' : 'rgba(139,148,158,0.15)',
                            color: layer.quantityRemaining > 0 ? '#2ea043' : '#8b949e',
                          }}
                        />
                      </Box>
                    );
                  })
                )}
              </Box>
            </Box>
          </Box>

          <Paper variant="outlined" sx={{ mt: 1.5, borderRadius: 3, px: 1.4, py: 1.1, bgcolor: 'background.paper', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
              <Typography variant="body2">Couches actives: {fifoLayers.length}</Typography>
              <Typography variant="body2">Stock total FIFO: {fifoLayers.reduce((sum, layer) => sum + layer.quantityRemaining, 0)} unites</Typography>
              <Typography variant="body2">Cout moyen pondere: {formatDZD(item.weightedAverageCost)}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>Valeur totale: {formatDZD(fifoLayers.reduce((sum, layer) => sum + layer.quantityRemaining * layer.unitCostHT, 0))}</Typography>
            </Stack>
          </Paper>
        </Paper>
      ) : null}

      {tab === 4 ? (
        <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>Retours Clients - En Quarantaine</Typography>
            <Chip label={`${item.returns.length} en attente d'inspection`} sx={{ bgcolor: 'rgba(210,153,34,0.15)', color: 'warning.main', fontWeight: 700 }} />
          </Stack>

          <Box sx={{ mt: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 1180 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: RETURNS_GRID_COLUMNS,
                    px: 1.4,
                    py: 1.15,
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    fontSize: 12,
                    fontWeight: 800,
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  <Box>Commande</Box>
                  <Box>Client</Box>
                  <Box>Date retour</Box>
                  <Box>Raison</Box>
                  <Box>Etat produit</Box>
                  <Box>Inspection</Box>
                  <Box>Action</Box>
                </Box>

                {item.returns.length === 0 ? (
                  <Box sx={{ px: 1.4, py: 2.5 }}>
                    <Typography color="text.secondary">Aucun retour en quarantaine.</Typography>
                  </Box>
                ) : (
                  item.returns.map((returnItem) => (
                    <ReturnRow
                      key={returnItem.returnId}
                      item={returnItem}
                      processing={processingReturnId === returnItem.returnId}
                      onApprove={() => onApproveReturn(returnItem.returnId)}
                      onReject={() => onRejectReturn(returnItem.returnId)}
                    />
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}

function matchesMovementFilter(type: string, filter: string) {
  if (filter === 'all') return true;
  return type === filter;
}

function AlertStrip({
  text,
  tone,
}: {
  text: string;
  tone: 'danger' | 'warning';
}) {
  const palette =
    tone === 'danger'
      ? { bg: 'rgba(248,81,73,0.15)', fg: '#f85149', border: '#f85149' }
      : { bg: 'rgba(210,153,34,0.15)', fg: '#d29922', border: '#d29922' };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, px: 1.4, py: 1.1, bgcolor: palette.bg, borderColor: palette.border }}>
      <Typography variant="body2" sx={{ color: palette.fg }}>
        {text}
      </Typography>
    </Paper>
  );
}

function TableShell({
  children,
  header,
  sx,
}: {
  children: ReactNode;
  header: string[];
  sx?: Record<string, unknown>;
}) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', ...sx }}>
      <Stack direction="row" sx={{ px: 1.4, py: 1.15, bgcolor: 'background.paper', fontWeight: 800, color: 'text.secondary', fontSize: 12 }}>
        {header.map((label) => (
          <Box key={label} sx={{ flex: 1 }}>{label}</Box>
        ))}
      </Stack>
      {children}
    </Box>
  );
}

function RowShell({ cells }: { cells: ReactNode[] }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ px: 1.4, py: 1.15, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
      {cells.map((cell, index) => (
        <Box key={index} sx={{ flex: 1, minWidth: 0 }}>
          {cell}
        </Box>
      ))}
    </Stack>
  );
}

function ReturnRow({
  item,
  processing,
  onApprove,
  onReject,
}: {
  item: InventoryReturn;
  processing: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const inspectionLabel =
    item.inspectionStatus === 'approved'
      ? 'Approuve'
      : item.inspectionStatus === 'rejected'
        ? 'Rejete'
        : 'En attente';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: RETURNS_GRID_COLUMNS,
        px: 1.4,
        py: 1.2,
        alignItems: 'center',
        borderTop: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Typography sx={{ color: 'primary.main', fontWeight: 800 }} noWrap>
        #{item.orderId.replace('CMD-', '')}
      </Typography>
      <Typography variant="body2" noWrap>
        {item.clientPhone || 'Client N/A'}
      </Typography>
      <Typography variant="body2" noWrap>
        {item.returnedAt ? relativeTime(item.returnedAt) : 'Hier'}
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {item.reason || item.quality}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.orderId} - {item.quantity} unite{item.quantity > 1 ? 's' : ''}
        </Typography>
      </Box>
      <Chip
        label={item.productState || item.quality}
        size="small"
        sx={{
          width: 'fit-content',
          bgcolor: item.productState === 'Endommage' ? 'rgba(248,81,73,0.15)' : 'rgba(46,160,67,0.15)',
          color: item.productState === 'Endommage' ? '#f85149' : '#2ea043',
        }}
      />
      <Chip
        label={inspectionLabel}
        size="small"
        sx={{
          width: 'fit-content',
          bgcolor:
            inspectionLabel === 'Approuve'
              ? 'rgba(46,160,67,0.15)'
              : inspectionLabel === 'Rejete'
                ? 'rgba(248,81,73,0.15)'
                : 'rgba(210,153,34,0.15)',
          color:
            inspectionLabel === 'Approuve'
              ? '#2ea043'
              : inspectionLabel === 'Rejete'
                ? '#f85149'
                : '#d29922',
        }}
      />
      <Stack direction="row" spacing={0.75}>
        <Button
          size="small"
          variant="contained"
          color="success"
          disabled={processing}
          sx={{ borderRadius: 999 }}
          onClick={() => void onApprove()}
        >
          Approuver
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={processing}
          sx={{ borderRadius: 999 }}
          onClick={() => void onReject()}
        >
          Rejeter
        </Button>
      </Stack>
    </Box>
  );
}
