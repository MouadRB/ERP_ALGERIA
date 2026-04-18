'use client';

import { useMemo, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { InventoryItem } from '../inventory.types';
import {
  formatDZD,
  getInventoryThumbnail,
  getStockMeta,
} from '../inventory.ui';

type StockTableProps = {
  loading?: boolean;
  onAdjust: (sku: string) => void;
  onHistory: (sku: string) => void;
  onMovement: (sku: string) => void;
  onToggleAll: () => void;
  onToggleSelection: (sku: string) => void;
  onView: (sku: string) => void;
  rows: InventoryItem[];
  selectedIds: string[];
};

const GRID_COLUMNS =
  '48px minmax(300px,2.6fr) minmax(122px,1fr) minmax(140px,1fr) minmax(92px,0.7fr) minmax(106px,0.8fr) minmax(72px,0.6fr) minmax(88px,0.7fr) minmax(110px,0.9fr) minmax(112px,0.9fr) minmax(146px,1fr) 100px';

function ProductThumbnail({
  imageUrl,
  name,
  sku,
}: {
  imageUrl?: string;
  name: string;
  sku: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const fallbackSrc = useMemo(() => getInventoryThumbnail(name, sku), [name, sku]);
  const [failed, setFailed] = useState(false);
  const resolvedSrc = imageUrl && !failed ? imageUrl : fallbackSrc;

  return (
    <Avatar
      variant="rounded"
      src={resolvedSrc}
      imgProps={{
        onError: () => {
          setFailed(true);
        },
      }}
      sx={{
        width: 42,
        height: 42,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <BrokenImageOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
    </Avatar>
  );
}

export default function StockTable({
  loading,
  onAdjust,
  onHistory,
  onMovement,
  onToggleAll,
  onToggleSelection,
  onView,
  rows,
  selectedIds,
}: StockTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuSku, setMenuSku] = useState<string | null>(null);

  const rowMap = useMemo(() => new Map(rows.map((row) => [row.sku, row])), [rows]);
  const activeMenuRow = menuSku ? rowMap.get(menuSku) : null;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 1480 }}>
          {/* GitHub Style Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: GRID_COLUMNS,
              alignItems: 'center',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? '#161b22' : '#f6f8fa',
              color: 'text.secondary',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Box>
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={!allSelected && selectedIds.length > 0}
                onChange={onToggleAll}
                sx={{ p: 0 }}
              />
            </Box>
            <Box>Produit</Box>
            <Box>SKU</Box>
            <Box>Catégorie</Box>
            <Box>Stock dispo</Box>
            <Box>Réservé</Box>
            <Box>Seuil</Box>
            <Box>Stock total</Box>
            <Box>Coût FIFO</Box>
            <Box>Valeur stock</Box>
            <Box>Statut</Box>
            <Box sx={{ textAlign: 'right' }}>Actions</Box>
          </Box>

          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    height: 72,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              ))
            : rows.map((row) => {
                const stockMeta = getStockMeta(row);
                const isSelected = selectedIds.includes(row.sku);

                return (
                  <Box
                    key={row.sku}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: GRID_COLUMNS,
                      alignItems: 'center',
                      px: 2,
                      py: 1.25,
                      minHeight: 72,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: isSelected 
                        ? (isDark ? alpha(theme.palette.primary.main, 0.1) : 'rgba(88,166,255,0.08)') 
                        : 'transparent',
                      '&:hover': {
                        bgcolor: isDark ? alpha(theme.palette.divider, 0.2) : '#f6f8fa',
                      },
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <Box>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => onToggleSelection(row.sku)}
                        sx={{ p: 0 }}
                      />
                    </Box>

                    <Box sx={{ minWidth: 0, pr: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <ProductThumbnail
                          imageUrl={row.imageUrl}
                          name={row.nameFr}
                          sku={row.sku}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                            noWrap
                          >
                            {row.nameFr}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            noWrap
                          >
                            {row.supplierName}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main', fontWeight: 600 }}>
                        {row.sku}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {row.categoryId}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" fontWeight={600} color={stockMeta.fg}>
                        {row.quantityAvailable}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {row.softReserved + row.hardReserved}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="error.main">
                        {row.reorderPoint}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.primary" fontWeight={600}>
                        {row.quantityOnHand}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDZD(row.costFifo)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.primary" fontWeight={600}>
                        {formatDZD(row.stockValue)}
                      </Typography>
                    </Box>

                    <Box>
                      <Chip
                        label={stockMeta.label}
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: isDark ? alpha(stockMeta.fg, 0.15) : alpha(stockMeta.fg, 0.1),
                          color: stockMeta.fg,
                          border: '1px solid',
                          borderColor: isDark ? alpha(stockMeta.fg, 0.3) : 'transparent',
                          borderRadius: 1
                        }}
                      />
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuAnchor(event.currentTarget);
                          setMenuSku(row.sku);
                        }}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MoreVertRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          elevation: 0,
          sx: { 
            mt: 0.5,
            minWidth: 160,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(149,157,165,0.2)',
          }
        }}
      >
        <MenuItem onClick={() => { if (activeMenuRow) onView(activeMenuRow.sku); setMenuAnchor(null); }}>
          <Typography variant="body2">Voir détails</Typography>
        </MenuItem>
        <MenuItem onClick={() => { if (activeMenuRow) onAdjust(activeMenuRow.sku); setMenuAnchor(null); }}>
          <Typography variant="body2">Modifier</Typography>
        </MenuItem>
        <MenuItem onClick={() => { if (activeMenuRow) onMovement(activeMenuRow.sku); setMenuAnchor(null); }}>
          <Typography variant="body2">Mouvement stock</Typography>
        </MenuItem>
        <MenuItem onClick={() => { if (activeMenuRow) onHistory(activeMenuRow.sku); setMenuAnchor(null); }}>
          <Typography variant="body2">Historique</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
