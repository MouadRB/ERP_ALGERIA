'use client';

import { useMemo, useState, MouseEvent } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { CatalogueEntry } from '../../catalogue.types';
import {
  CHANNEL_ORDER,
  formatDZD,
  getCatalogueStatusMeta,
  getCatalogueVisual,
  getChannelMeta,
  getHighlightLabel,
  getStockStatusMeta,
} from '../../catalogue.ui';

type CatalogueTableProps = {
  currentParams: Record<string, string>;
  loading?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onParamsChange: (patch: Record<string, string>) => void;
  onPublish: (id: string) => void;
  onSchedule: (id: string) => void;
  onToggleAll: () => void;
  onToggleSelection: (id: string) => void;
  onUnpublish: (id: string) => void;
  onView: (id: string) => void;
  page: number;
  pageSize: number;
  rows: CatalogueEntry[];
  selectedIds: string[];
  totalCount: number;
};

const COLUMNS: Array<{ id: string; label: string; sortable?: boolean }> = [
  { id: 'nameFr', label: 'PRODUIT (FR/AR)', sortable: true },
  { id: 'sku', label: 'SKU', sortable: true },
  { id: 'categoryId', label: 'CATEGORIE', sortable: true },
  { id: 'priceTTC', label: 'PRIX TTC', sortable: true },
  { id: 'availableStock', label: 'STOCK D/S/H', sortable: true },
  { id: 'wilayas', label: 'WILAYAS' },
  { id: 'channels', label: 'CANAUX' },
  { id: 'status', label: 'STATUT CAT.', sortable: true },
  { id: 'stockStatus', label: 'STATUT STOCK', sortable: true },
  { id: 'actions', label: 'ACTIONS' },
];

export default function CatalogueTable({
  currentParams,
  loading,
  onDelete,
  onEdit,
  onPageChange,
  onPageSizeChange,
  onParamsChange,
  onPublish,
  onSchedule,
  onToggleAll,
  onToggleSelection,
  onUnpublish,
  onView,
  page,
  pageSize,
  rows,
  selectedIds,
  totalCount,
}: CatalogueTableProps) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const sortBy = currentParams.sortBy ?? 'updatedAt';
  const sortOrder = (currentParams.sortOrder as 'asc' | 'desc') ?? 'desc';

  const handleSort = (column: string) => {
    onParamsChange({
      page: '1',
      sortBy: column,
      sortOrder: sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 1180 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
              <TableCell padding="checkbox" sx={{ borderColor: 'divider' }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && selectedIds.length > 0}
                  onChange={onToggleAll}
                />
              </TableCell>
              {COLUMNS.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: 'text.secondary',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    borderColor: 'divider',
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortOrder : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index} sx={{ bgcolor: 'transparent' }}>
                  <TableCell colSpan={11} sx={{ borderColor: 'divider' }}>
                    <Box sx={{ height: 68, bgcolor: 'background.paper', borderRadius: 3, my: 0.4 }} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading &&
              rows.map((row) => (
                <CatalogueRow
                  key={row.id}
                  row={row}
                  selected={selectedIds.includes(row.id)}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onPublish={onPublish}
                  onSchedule={onSchedule}
                  onToggleSelection={onToggleSelection}
                  onUnpublish={onUnpublish}
                  onView={onView}
                />
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 7, borderColor: 'divider' }}>
                  <Typography color="text.secondary">
                    Aucun produit catalogue ne correspond aux filtres actifs.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={Math.max(page - 1, 0)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        labelRowsPerPage="Par page"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        sx={{ borderTop: (t) => `1px solid ${t.palette.divider}`, color: 'text.primary' }}
      />
    </Paper>
  );
}

function CatalogueRow({
  row,
  selected,
  onDelete,
  onEdit,
  onPublish,
  onSchedule,
  onToggleSelection,
  onUnpublish,
  onView,
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onSchedule: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onUnpublish: (id: string) => void;
  onView: (id: string) => void;
  row: CatalogueEntry;
  selected: boolean;
}) {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const visual = getCatalogueVisual(row.id);
  const statusMeta = getCatalogueStatusMeta(row.status);
  const stockMeta = getStockStatusMeta(row.stockStatus);
  const highlight = getHighlightLabel({
    conversionRate: row.metrics.conversionRate,
    returnRate: row.metrics.returnRate,
    status: row.status,
  });
  
  const wilayasColor = row.allowedWilayasLabel === '48/48' ? theme.palette.success.main : theme.palette.warning.main;
  const borderColor = useMemo(() => {
    switch (row.status) {
      case 'masked': return theme.palette.error.main;
      case 'scheduled': return theme.palette.info.main;
      case 'partial': return theme.palette.warning.main;
      case 'published': return theme.palette.success.main;
      default: return 'transparent';
    }
  }, [row.status, theme.palette]);

  return (
    <TableRow
      hover
      selected={selected}
      sx={{
        borderLeft: `3px solid ${borderColor}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        opacity: row.status === 'masked' ? 0.58 : 1,
        '& td': { py: 1.2, verticalAlign: 'top', borderColor: 'divider' },
        '&:hover': {
          bgcolor: 'background.paper',
        },
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={() => onToggleSelection(row.id)} />
      </TableCell>

      <TableCell sx={{ minWidth: 300 }}>
        <Stack direction="row" spacing={1.25}>
          <Avatar
            variant="rounded"
            src={row.product?.mediaUrls?.[0]}
            sx={{
              width: 46,
              height: 46,
              bgcolor: 'background.default',
              borderRadius: 1.8,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <BrokenImageOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          </Avatar>
          <Box>
            <Typography fontWeight={800} color="text.primary">{row.nameFr}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {row.nameAr}
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.6 }}>
              <Chip 
                label={`${row.variantCount} variantes`} 
                size="small" 
                sx={{
                  bgcolor: alpha(theme.palette.text.secondary, 0.15),
                  color: 'text.secondary',
                  border: `1px solid ${theme.palette.divider}`,
                  fontWeight: 600,
                }}
              />
              {highlight && (
                <Chip
                  label={highlight}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.info.main, 0.15), 
                    color: 'info.main', 
                    border: `1px solid ${theme.palette.info.main}`,
                    fontWeight: 700 
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography sx={{ color: 'primary.main', fontWeight: 800 }}>{row.sku}</Typography>
      </TableCell>

      <TableCell>
        <Typography fontWeight={700} color="text.primary">{row.categoryId}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.categoryPath.split('>').slice(-1)[0]?.trim() ?? row.categoryId}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography fontWeight={800} color="text.primary">{formatDZD(row.priceTTC)}</Typography>
      </TableCell>

      <TableCell>
        <Typography fontWeight={800} sx={{ color: stockMeta.fg }}>
          Dispo: {row.availableStock}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          S: {row.reservedStock}  H: {row.inventory?.quantityOnHand ?? 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography fontWeight={700} sx={{ color: wilayasColor }}>
          {row.allowedWilayasLabel}
        </Typography>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={0.75}>
          {CHANNEL_ORDER.map((channel) => {
            const meta = getChannelMeta(channel);
            const Icon = meta.icon;
            const active = row.channels.includes(channel);
            return (
              <Tooltip key={channel} title={`${meta.label} - ${active ? 'Actif' : 'Inactif'}`}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: active ? meta.fg : 'divider',
                    bgcolor: active ? alpha(meta.fg, 0.15) : 'transparent',
                    color: active ? meta.fg : 'text.disabled',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </TableCell>

      <TableCell>
        <Chip
          label={statusMeta.label}
          size="small"
          sx={{ 
            bgcolor: alpha(statusMeta.fg, 0.15), 
            color: statusMeta.fg, 
            border: `1px solid ${statusMeta.fg}`,
            fontWeight: 700 
          }}
        />
      </TableCell>

      <TableCell>
        <Chip
          label={stockMeta.label}
          size="small"
          sx={{ 
            bgcolor: alpha(stockMeta.fg, 0.15), 
            color: stockMeta.fg, 
            border: `1px solid ${stockMeta.fg}`,
            fontWeight: 700 
          }}
        />
      </TableCell>

      <TableCell align="right">
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          {/* Action Icons stripped of bright hardcoded colors, using text.secondary */}
          <Tooltip title="Voir">
            <IconButton size="small" onClick={() => onView(row.id)} sx={{ color: 'text.secondary' }}>
              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ouvrir fiche">
            <IconButton size="small" onClick={() => onView(row.id)} sx={{ color: 'text.secondary' }}>
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Plus d'actions">
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: 'text.secondary' }}>
              <MoreVertOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{ sx: { borderRadius: 3, minWidth: 190, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}
        >
          <MenuItem onClick={() => { onDelete(row.id); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
            Supprimer
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}
