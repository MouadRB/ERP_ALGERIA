'use client';
// apps/web/modules/pim/components/PimDetailSidebar.tsx
import { Box, Paper, Typography, Stack, Chip, Button, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import AccessTimeIcon     from '@mui/icons-material/AccessTime';
import LockOutlinedIcon   from '@mui/icons-material/LockOutlined';
import WarningAmberIcon   from '@mui/icons-material/WarningAmber';

import type { Product } from './pim.types';
import { getTvaLabel, getTvaPercent, getTvaAmount, getTotalStock, getRuptureCount, formatDZD, formatDate } from './pim.helpers';
import PimStatusBadge from './PimStatusBadge';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} mb={1.5} sx={{ fontSize: '0.82rem' }}>{title}</Typography>
      {children}
    </Paper>
  );
}

export default function PimDetailSidebar({ product }: { product: Product }) {
  const tvaAmount  = getTvaAmount(product.priceTTC, product.priceHT);
  const tvaPercent = getTvaPercent(product.tvaRate);
  const totalStock = getTotalStock(product);
  const ruptures   = getRuptureCount(product);
  const returnPct  = product.returnRate ? Math.round(product.returnRate * 100) : null;

  return (
    <Box>
      {/* Statut */}
      <Card title="Statut & Publication">
        <Box mb={1.5}><PimStatusBadge status={product.status} size="medium" /></Box>
        <Stack spacing={0.75} mb={2}>
          <Stack direction="row" alignItems="flex-start" spacing={0.75}>
            <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main', mt: 0.1 }} />
            <Box>
              <Typography variant="caption" fontWeight={600}>Créé par : <Box component="span" sx={{ color: 'primary.main' }}>{product.createdBy}</Box></Typography>
              <Typography variant="caption" color="text.secondary" display="block">{formatDate(product.createdAt)}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="flex-start" spacing={0.75}>
            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary', mt: 0.1 }} />
            <Box>
              <Typography variant="caption" fontWeight={600}>Mis à jour :</Typography>
              <Typography variant="caption" color="text.secondary" display="block">{formatDate(product.updatedAt)}</Typography>
            </Box>
          </Stack>
        </Stack>
        <Stack spacing={1}>
          <Button variant="outlined" fullWidth size="small" sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#d29922', color: 'warning.main', '&:hover': { bgcolor: 'rgba(210,153,34,0.12)' } }}>
            Passer en Brouillon
          </Button>
          <Button variant="outlined" fullWidth size="small" sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#fca5a5', color: 'error.main', '&:hover': { bgcolor: 'rgba(248,81,73,0.08)' } }}>
            Discontinuer
          </Button>
        </Stack>
      </Card>

      {/* Prix */}
      <Card title="Prix">
        <Typography variant="h5" fontWeight={700} mb={0.25}>{formatDZD(product.priceTTC)}</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
          ≈ {(product.priceTTC / 147).toFixed(2)} EUR (indicatif)
        </Typography>
        {[
          { label: 'Prix HT :', value: `${product.priceHT.toLocaleString('fr-DZ')} DZD` },
          { label: `TVA (${tvaPercent}%) :`, value: `${tvaAmount.toLocaleString('fr-DZ')} DZD`, color: '#fd8c73' },
          { label: 'Prix TTC :', value: formatDZD(product.priceTTC), bold: true },
        ].map((r) => (
          <Stack key={r.label} direction="row" justifyContent="space-between" mb={0.4}>
            <Typography variant="caption" color="text.secondary">{r.label}</Typography>
            <Typography variant="caption" fontWeight={r.bold ? 700 : 500} sx={{ color: r.color }}>{r.value}</Typography>
          </Stack>
        ))}
        {product.costFifo && (
          <>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Typography variant="caption" color="text.secondary">Prix Coût FIFO :</Typography>
                <LockOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
              </Stack>
              <Chip label="Confidentiel" size="small" sx={{ bgcolor: 'background.paper', fontSize: '0.62rem', height: 18, color: 'text.secondary' }} />
            </Stack>
          </>
        )}
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">TVA :</Typography>
          <Chip label={getTvaLabel(product.tvaRate)} size="small" sx={{ bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main', fontSize: '0.65rem', height: 20, fontWeight: 600 }} />
        </Stack>
      </Card>

      {/* Stock */}
      <Card title="Stock">
        {product.variants.length === 0 ? (
          <Typography variant="caption" color="text.secondary">Aucune variante</Typography>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography variant="caption" color="text.secondary">Total :</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: totalStock === 0 ? '#f85149' : totalStock < 10 ? '#d29922' : '#2ea043' }}>
                {totalStock} unités
              </Typography>
            </Stack>
            {ruptures > 0 && (
              <Stack direction="row" justifyContent="space-between" mb={0.75}>
                <Typography variant="caption" color="text.secondary">En rupture :</Typography>
                <Typography variant="caption" fontWeight={700} color="error.main">{ruptures} / {product.variants.length}</Typography>
              </Stack>
            )}
            <Divider sx={{ my: 1 }} />
            <Stack spacing={0.5}>
              {product.variants.map((v) => (
                <Stack key={v.variantId} direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" fontFamily="monospace" sx={{ color: 'primary.main', fontSize: '0.68rem' }}>{v.sku}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>{Object.values(v.attributes).join(' / ')}</Typography>
                  </Box>
                  <Chip label={v.stock} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20, bgcolor: v.stock === 0 ? 'rgba(248,81,73,0.08)' : v.stock < 5 ? 'rgba(210,153,34,0.12)' : 'rgba(46,160,67,0.08)', color: v.stock === 0 ? '#f85149' : v.stock < 5 ? '#d29922' : '#2ea043' }} />
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Card>

      {/* Taux Retour */}
      {returnPct !== null && (
        <Card title="Performance">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary">Taux de retour :</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: returnPct >= 30 ? '#f85149' : returnPct >= 20 ? '#d29922' : '#2ea043' }}>
              {returnPct}%
            </Typography>
          </Stack>
          <Box sx={{ height: 6, bgcolor: 'action.hover', borderRadius: 3 }}>
            <Box sx={{ width: `${Math.min(returnPct, 100)}%`, height: '100%', bgcolor: returnPct >= 30 ? '#f85149' : returnPct >= 20 ? '#fd8c73' : '#2ea043', borderRadius: 3 }} />
          </Box>
          {returnPct >= 30 && (
            <Box sx={{ mt: 1, bgcolor: (t) => alpha(t.palette.error.main, 0.1), border: '1px solid', borderColor: 'error.main', borderRadius: 1.5, p: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <WarningAmberIcon sx={{ fontSize: 14, color: 'error.main' }} />
                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, fontSize: '0.68rem' }}>
                  Taux ≥ 30% — Révision obligatoire
                </Typography>
              </Stack>
            </Box>
          )}
        </Card>
      )}

      {/* Identifiants */}
      <Card title="Identifiants">
        {[
          { label: 'ID :', value: product.id, mono: false },
          { label: 'SKU :', value: product.sku, mono: true },
          { label: 'Catégorie :', value: product.categoryId, mono: false },
          { label: 'Marque :', value: product.brandId, mono: false },
        ].map((r) => (
          <Stack key={r.label} direction="row" justifyContent="space-between" mb={0.4}>
            <Typography variant="caption" color="text.secondary">{r.label}</Typography>
            <Typography variant="caption" fontWeight={600} fontFamily={r.mono ? 'monospace' : undefined}>{r.value}</Typography>
          </Stack>
        ))}
      </Card>
    </Box>
  );
}
