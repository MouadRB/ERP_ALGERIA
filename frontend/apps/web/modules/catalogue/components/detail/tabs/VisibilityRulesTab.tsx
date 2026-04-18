'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  InputBase,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import type { CatalogueEntry } from '../../../catalogue.types';

type VisibilityRulesTabProps = {
  entry: CatalogueEntry;
};

type RuleState = Record<string, boolean>;

export default function VisibilityRulesTab({ entry }: VisibilityRulesTabProps) {
  const variants = entry.product?.variants ?? [];
  const zeroStockVariants = (entry.availableStock ?? 0) <= 0 ? variants : [];
  const [threshold, setThreshold] = useState(String(entry.visibilityRules.minStock));
  const [rules, setRules] = useState<RuleState>({
    autoMaskZero: entry.visibilityRules.autoMaskOnZeroStock,
    autoRepublish: false,
    excludeVariantZero: zeroStockVariants.length > 0,
    stockBadge: (entry.inventory?.quantityAvailable ?? 0) <= entry.visibilityRules.minStock,
    homepageFeature: false,
    hideDiscontinued: false,
    blockInvalidOcr: entry.status === 'draft',
    hideNegativeStock: true,
  });

  const rows = useMemo(
    () => [
      {
        id: 'autoMaskZero',
        label: 'Masquer si stock disponible = 0',
        helperTop: 'Source: Module Inventory - Application instantanee',
        helperBottom: 'Stock Soft et Hard ne comptent pas comme disponibles',
        locked: true,
        chips: ['Inventory', 'Catalogue'],
      },
      {
        id: 'autoRepublish',
        label: 'Republier si stock dispo > 0',
        helperTop: 'Declenche par: reception de stock dans Inventory (mouvement FIFO)',
        helperBottom: '',
        locked: true,
        chips: [],
      },
      {
        id: 'excludeVariantZero',
        label: 'Exclure variante si stock dispo = 0',
        helperTop: `Actuellement: ${zeroStockVariants.length}/${variants.length || entry.variantCount} variantes exclues (${zeroStockVariants.map((variant) => variant.attributes.taille || variant.sku.split('-').slice(-1)[0]).slice(0, 2).join(' / ') || 'aucune'})`,
        helperBottom: '',
        locked: true,
        chips: [],
      },
      {
        id: 'stockBadge',
        label: 'Badge Stock Limite si dispo <= seuil',
        helperTop: `Actuellement ACTIF - dispo (${entry.inventory?.quantityAvailable ?? 0}) <= seuil (${threshold || '0'})`,
        helperBottom: '',
        locked: false,
        chips: [],
      },
      {
        id: 'homepageFeature',
        label: "Mettre en avant sur page d'accueil",
        helperTop: '',
        helperBottom: '',
        locked: false,
        chips: [],
      },
      {
        id: 'hideDiscontinued',
        label: 'Masquer si produit Discontinue',
        helperTop: '',
        helperBottom: '',
        locked: true,
        chips: [],
      },
      {
        id: 'blockInvalidOcr',
        label: 'Ne pas publier si brouillon OCR non valide',
        helperTop: '',
        helperBottom: '',
        locked: true,
        chips: [],
      },
      {
        id: 'hideNegativeStock',
        label: 'Masquer si stock negatif (anomalie Inventory)',
        helperTop: 'Stock negatif = anomalie de donnees - Correction dans Inventory requise',
        helperBottom: '',
        locked: true,
        chips: ['Inventory', 'Catalogue'],
      },
    ],
    [
      entry.inventory?.quantityAvailable,
      entry.variantCount,
      threshold,
      variants,
      zeroStockVariants,
    ],
  );

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        Regles Actives
      </Typography>

      <Stack sx={{ mt: 1.25 }}>
        {rows.map((row, index) => (
          <Box key={row.id}>
            {index > 0 && <Divider />}
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="flex-start" sx={{ py: 1.6 }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={700}>{row.label}</Typography>
                  {row.locked && <LockOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />}
                  {row.chips.map((chip) => (
                    <Chip key={chip} label={chip} size="small" sx={{ bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main' }} />
                  ))}
                </Stack>

                {row.helperTop ? (
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.35 }}>
                    {row.helperTop}
                  </Typography>
                ) : null}
                {row.helperBottom ? (
                  <Typography variant="caption" sx={{ display: 'block', color: row.id === 'autoMaskZero' ? '#fd8c73' : '#8b949e', mt: 0.2 }}>
                    {row.helperBottom}
                  </Typography>
                ) : null}

                {row.id === 'stockBadge' && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Box
                      sx={{
                        width: 64,
                        px: 1.25,
                        py: 0.55,
                        border: '1px solid', borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.default',
                      }}
                    >
                      <InputBase
                        value={threshold}
                        onChange={(event) => setThreshold(event.target.value.replace(/[^\d]/g, ''))}
                        inputProps={{ inputMode: 'numeric' }}
                        sx={{ fontSize: '0.92rem', fontWeight: 700 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      unites
                    </Typography>
                  </Stack>
                )}
              </Box>

              <Switch
                checked={rules[row.id]}
                onChange={(_, checked) =>
                  setRules((current) => ({
                    ...current,
                    [row.id]: checked,
                  }))
                }
              />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
