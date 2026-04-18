'use client';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { CatalogueEntry } from '../../catalogue.types';
import {
  formatDZD,
  getCatalogueStatusMeta,
  getChannelMeta,
} from '../../catalogue.ui';

type ApercuClientModalProps = {
  entry: CatalogueEntry | null;
  onClose: () => void;
  open: boolean;
};

export default function ApercuClientModal({ entry, onClose, open }: ApercuClientModalProps) {
  const statusMeta = getCatalogueStatusMeta(entry?.status ?? 'draft');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: 'text.primary' }}>Apercu client</DialogTitle>
      <DialogContent>
        {entry && (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: '12px',
              overflow: 'hidden',
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: { xs: 3, md: 4 },
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={3}
                justifyContent="space-between"
              >
                <Stack spacing={1.5}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Fiche visible cote client
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary' }}>
                    {entry.nameFr}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {entry.nameAr}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={statusMeta.label}
                      sx={{ bgcolor: statusMeta.bg, color: statusMeta.fg, fontWeight: 700 }}
                    />
                    <Chip
                      label={entry.categoryPath}
                      variant="outlined"
                      sx={{ borderColor: 'divider' }}
                    />
                    <Chip
                      label={`${entry.availableStock} en stock`}
                      variant="outlined"
                      sx={{ borderColor: 'divider' }}
                    />
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    minWidth: { xs: '100%', lg: 220 },
                    bgcolor: 'background.default',
                    borderRadius: '12px',
                    p: 2.5,
                    border: '1px solid', borderColor: 'divider',
                  }}
                >
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    Prix TTC
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary', mb: 1 }}>
                    {formatDZD(entry.priceTTC)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    SKU: {entry.sku}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={2}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: '12px', borderColor: 'divider', bgcolor: 'background.paper' }}
                >
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>
                    Canaux actifs
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {entry.channelDetails.length > 0 ? (
                      entry.channelDetails.map((channel) => {
                        const meta = getChannelMeta(channel.id);
                        const Icon = meta.icon;
                        return (
                          <Chip
                            key={channel.id}
                            icon={<Icon sx={{ color: `${meta.fg} !important` }} />}
                            label={`${meta.label} - ${channel.status}`}
                            sx={{
                              bgcolor: meta.bg,
                              color: meta.fg,
                              borderRadius: 2,
                            }}
                          />
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Aucun canal encore publie.
                      </Typography>
                    )}
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1, color: 'text.primary' }}>
                    Resume experience client
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Produit visible sur {entry.channelCount} canal(aux) avec {entry.allowedWilayasLabel}{' '}
                    wilayas autorisees. Conversion recente: {(entry.metrics.conversionRate * 100).toFixed(1)}%.
                  </Typography>
                </Paper>
              </Stack>
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
