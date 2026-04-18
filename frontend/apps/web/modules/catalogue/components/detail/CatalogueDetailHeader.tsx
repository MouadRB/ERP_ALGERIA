'use client';

import Link from 'next/link';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { CatalogueEntry } from '../../catalogue.types';
import {
  formatDZD,
  getCatalogueStatusMeta,
  getCatalogueVisual,
  getChannelMeta,
  getPriceHT,
} from '../../catalogue.ui';

type CatalogueDetailHeaderProps = {
  entry: CatalogueEntry;
  isReadOnly?: boolean;
  locale: string;
  onHistory: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onSave: () => void;
  onUnpublish: () => void;
};

export default function CatalogueDetailHeader({
  entry,
  isReadOnly = false,
  locale,
  onHistory,
  onPreview,
  onPublish,
  onSave,
  onUnpublish,
}: CatalogueDetailHeaderProps) {
  const isPublished = entry.status === 'published' || entry.status === 'partial';
  const statusMeta = getCatalogueStatusMeta(entry.status);
  const visual = getCatalogueVisual(entry.id);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        p: { xs: 2, md: 3 },
        mb: 3,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        component={Link}
        href={`/${locale}/catalogue`}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          mb: 2.5,
          color: 'text.secondary',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 14 }} />
        Retour au Catalogue
      </Typography>

      <Stack
        direction={{ xs: 'column', xl: 'row' }}
        spacing={3}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            variant="rounded"
            src={entry.product?.mediaUrls?.[0]}
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: 'background.default',
              background: `linear-gradient(135deg, ${visual.start}, ${visual.end})`,
              boxShadow: `0 14px 30px ${visual.soft}`,
              flexShrink: 0,
            }}
          />

          <Stack spacing={1.25}>
            <Typography variant="h4" fontWeight={800}>
              {entry.nameFr}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {entry.nameAr}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${statusMeta.label} - ${entry.channelCount} canaux`}
                sx={{ bgcolor: statusMeta.bg, color: statusMeta.fg, fontWeight: 700 }}
              />
              <Chip label={entry.sku} variant="outlined" />
              <Chip label={entry.categoryPath} variant="outlined" />
              <Chip label={`${entry.variantCount} variantes`} variant="outlined" />
              {entry.channelDetails.map((channel) => {
                const meta = getChannelMeta(channel.id);
                return (
                  <Chip
                    key={channel.id}
                    label={meta.shortLabel}
                    sx={{ bgcolor: meta.bg, color: meta.fg }}
                  />
                );
              })}
            </Stack>
          </Stack>
        </Stack>

        <Stack spacing={1.5} sx={{ minWidth: { xl: 340 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <Button variant="outlined" startIcon={<VisibilityOutlinedIcon />} onClick={onPreview}>
              Apercu client
            </Button>
            <Button variant="outlined" startIcon={<HistoryOutlinedIcon />} onClick={onHistory}>
              Historique
            </Button>
            {!isReadOnly && (
              <>
                {isPublished ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<VisibilityOffOutlinedIcon />}
                    onClick={onUnpublish}
                  >
                    Depublier
                  </Button>
                ) : (
                  <Button variant="outlined" startIcon={<PublishOutlinedIcon />} onClick={onPublish}>
                    Publier
                  </Button>
                )}
                <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={onSave}>
                  Enregistrer
                </Button>
              </>
            )}
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="body2" sx={{ color: 'success.main' }}>
                PIM actif: {entry.productId}
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main' }}>
                Inventaire: {entry.sku}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                MDM REF: {entry.product?.id ?? entry.productId}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Fournisseur: {entry.product?.supplierName ?? 'FERZA'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
                {formatDZD(entry.priceTTC)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TVA 19% Standard - HT: {formatDZD(getPriceHT(entry.priceTTC))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Derniere modification: {new Date(entry.history[0]?.at ?? Date.now()).toLocaleString('fr-DZ')}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
