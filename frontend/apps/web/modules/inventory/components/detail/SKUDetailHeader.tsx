'use client';

import Link from 'next/link';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import type { InventoryItem } from '../../inventory.types';
import { getInventoryThumbnail, getStockMeta } from '../../inventory.ui';

type SKUDetailHeaderProps = {
  item: InventoryItem;
  locale: string;
  onHistory: () => void;
  onMove: () => void;
  onReceive: () => void;
};

export default function SKUDetailHeader({
  item,
  locale,
  onHistory,
  onMove,
  onReceive,
}: SKUDetailHeaderProps) {
  const stockMeta = getStockMeta({
    quantityAvailable: item.quantityAvailable,
    reorderPoint: item.reorderPoint,
  });
  const thumbnail = item.imageUrl || getInventoryThumbnail(item.nameFr, item.sku);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        p: { xs: 2.25, md: 3 },
        mb: 2.5,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        component={Link}
        href={`/${locale}/inventory`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.8,
          mb: 2,
          color: 'text.secondary',
          textDecoration: 'none',
          fontWeight: 700,
        }}
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        Retour a l&apos;inventaire
      </Typography>

      <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={2.5}>
        <Stack direction="row" spacing={1.8}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3.5,
              backgroundImage: `url(${thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: (t) => t.palette.background.default,
              border: '1px solid', borderColor: 'divider',
              flexShrink: 0,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary' }}>
              {item.nameFr}
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.75, color: 'text.secondary' }}>
              {item.nameAr}
            </Typography>

            <Stack direction="row" spacing={0.8} flexWrap="wrap" sx={{ mt: 1.25 }}>
              <Chip
                label={stockMeta.label}
                size="small"
                sx={{ bgcolor: stockMeta.bg, color: stockMeta.fg, fontWeight: 800 }}
              />
              <Chip label={item.sku} size="small" sx={{ bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main', border: '1px solid #58a6ff', fontWeight: 700 }} />
              <Chip
                label={item.categoryId}
                size="small"
                sx={{ bgcolor: 'rgba(139,148,158,0.15)', color: 'text.secondary', border: '1px solid', borderColor: 'divider' }}
              />
              {item.barcode ? (
                <Chip label={`EAN ${item.barcode}`} size="small" sx={{ bgcolor: 'rgba(210,153,34,0.15)', color: 'warning.main', border: '1px solid #d29922' }} />
              ) : null}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.25 }}>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                PIM Actif
              </Typography>
              <Typography
                component={Link}
                href={`/${locale}/pim/${item.productId}`}
                variant="body2"
                sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 700 }}
              >
                Ouvrir dans PIM
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                /
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                MDM: {item.mdmRef || 'REF-000'}
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<HistoryOutlinedIcon />}
                onClick={onHistory}
                sx={{ borderRadius: 999, borderColor: 'divider', color: 'text.secondary', minHeight: 32 }}
              >
                Historique complet
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<AddRoundedIcon />}
                onClick={onReceive}
                sx={{ borderRadius: 999, minHeight: 32 }}
              >
                Receptionner Stock
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={onMove}
                sx={{ borderRadius: 999, boxShadow: 'none', minHeight: 32 }}
              >
                Mouvement de Stock
              </Button>
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ minWidth: { xl: 320 }, textAlign: { xs: 'left', xl: 'right' } }}>
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
            Entrepot Alger
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.8, color: 'success.main', fontWeight: 700 }}>
            Prix TTC: {item.salePriceTTC?.toLocaleString('fr-DZ') || '0'} DZD
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
            Fournisseur: {item.supplierName} - REF: {item.supplierRef}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stock dispo (soft): {item.quantityAvailable} u / Reserve (hard): {item.hardReserved} u / Quarantaine: {item.quantityQuarantined} u
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
