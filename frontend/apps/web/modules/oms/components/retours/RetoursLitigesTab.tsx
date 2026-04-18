'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon  from '@mui/icons-material/WarningAmberRounded';
import ReplayOutlinedIcon        from '@mui/icons-material/ReplayOutlined';
import GavelOutlinedIcon         from '@mui/icons-material/GavelOutlined';
import CloseIcon                 from '@mui/icons-material/Close';
import OpenInNewIcon             from '@mui/icons-material/OpenInNew';
import ContentCopyIcon           from '@mui/icons-material/ContentCopy';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useRouter }             from 'next/navigation';
import { useLocale }             from 'next-intl';
import { formatDZD, getWilayaByCode }             from '@ferza/shared';
import { useOMSOrder }           from '@/modules/oms/hooks/useOMSOrder';
import { useOMSRetours }         from '@/modules/oms/hooks/useOMSRetours';
import type { RetourItem, LitigeItem } from '@/modules/oms/hooks/useOMSRetours';
import RetoursTable from './RetoursTable';
import LitigeCard   from './LitigeCard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.length === 10 && d.startsWith('0')
    ? `+213 ${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
    : phone;
}

// ─── Order detail drawer ───────────────────────────────────────────────────────

function OrderDetailDrawer({
  orderId,
  onClose,
}: {
  orderId: string | null;
  onClose: () => void;
}) {
  const router  = useRouter();
  const locale  = useLocale();
  const { data, isLoading, isError } = useOMSOrder(orderId ?? '');
  const order = data?.data ?? null;
  const wilayaName = order?.wilayaCode
    ? getWilayaByCode(order.wilayaCode)?.name ?? order.wilayaCode
    : '';

  return (
    <Drawer
      anchor="right"
      open={!!orderId}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 440 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
          {isLoading ? <Skeleton width={180} /> : order ? `Commande ${order.reference}` : 'Détail commande'}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {isLoading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" height={52} />
            ))}
          </Stack>
        ) : isError || !order ? (
          <Alert severity="error">Commande introuvable.</Alert>
        ) : (
          <Stack spacing={2.5} divider={<Divider />}>

            {/* Status */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 0.75 }}>STATUT</Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  backgroundColor: 'grey.100',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
                  {order.status}
                </Typography>
              </Box>
            </Box>

            {/* Customer */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 0.75 }}>CLIENT</Typography>
              <Typography sx={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
                {fmtPhone(order.customerPhone)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                {locale === 'ar' ? order.customerNameAr : order.customerNameFr}
                {' - '}{wilayaName} ({order.wilayaCode})
              </Typography>
            </Box>

            {/* Products */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 1 }}>PRODUITS</Typography>
              <Stack spacing={0.75}>
                {order.items.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography sx={{ fontSize: 13, color: 'text.primary' }}>
                      {locale === 'ar' ? item.nameAr : item.nameFr}
                      <Typography component="span" sx={{ color: 'text.secondary', fontSize: 12, ml: 0.5 }}>
                        ×{item.quantity}
                      </Typography>
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', ml: 2, whiteSpace: 'nowrap' }}>
                      {formatDZD(item.unitPriceTTC * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* COD */}
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: (t) => t.palette.background.default, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Montant COD</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatDZD(order.codAmount)}
                </Typography>
              </Box>
            </Box>

            {/* Carrier */}
            {order.carrier && (
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 0.75 }}>CARRIER</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: 13 }}>{order.carrier}</Typography>
                </Box>
              </Box>
            )}

            {/* Date */}
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 0.75 }}>DATE CRÉATION</Typography>
              <Typography sx={{ fontSize: 13 }}>
                {new Date(order.createdAt).toLocaleDateString('fr-DZ', { dateStyle: 'long' })}
              </Typography>
            </Box>

          </Stack>
        )}
      </Box>

      {/* Footer */}
      {order && (
        <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <Button
            fullWidth
            variant="contained"
            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            onClick={() => { onClose(); router.push(`/${locale}/oms/${order.id}`); }}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Ouvrir page complète
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

// ─── Tracking dialog ───────────────────────────────────────────────────────────

function SuiviDialog({
  retour,
  onClose,
}: {
  retour: RetourItem | null;
  onClose: () => void;
}) {
  const handleCopy = () => {
    if (retour?.trackingNumber) {
      navigator.clipboard.writeText(retour.trackingNumber);
    }
  };

  return (
    <Dialog open={!!retour} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 16, pb: 0.5 }}>
        Suivi retour — {retour?.orderRef}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {/* Carrier + tracking */}
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: (t) => t.palette.background.default, border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 0.5 }}>
              CARRIER
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{retour?.carrier}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: 'primary.main' }}>
                {retour?.trackingNumber}
              </Typography>
              <IconButton size="small" onClick={handleCopy} sx={{ p: 0.5 }}>
                <ContentCopyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              </IconButton>
            </Box>
          </Box>

          {/* Product */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 0.5 }}>
              ARTICLE EN TRANSIT
            </Typography>
            <Typography sx={{ fontSize: 13 }}>
              {retour?.produit}
              {retour && retour.produitQty > 1 && (
                <Typography component="span" sx={{ color: 'text.secondary', fontSize: 12, ml: 0.5 }}>
                  ×{retour.produitQty}
                </Typography>
              )}
            </Typography>
          </Box>

          {/* Returned date */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'text.disabled', mb: 0.5 }}>
              RETOURNÉ LE
            </Typography>
            <Typography sx={{ fontSize: 13 }}>
              {retour
                ? new Date(retour.returnedAt).toLocaleDateString('fr-DZ', { dateStyle: 'long' })
                : '—'}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ fontSize: 12 }}>
            Ce colis est en transit retour vers l'entrepôt. Réception estimée sous 2–3 jours ouvrables.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Contact dialog ────────────────────────────────────────────────────────────

function ContactDialog({
  litige,
  onClose,
}: {
  litige: LitigeItem | null;
  onClose: () => void;
}) {
  const isClient = litige?.actionLabel?.toLowerCase().includes('client');

  return (
    <Dialog open={!!litige} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 16, pb: 0.5 }}>
        {litige?.actionLabel} — {litige?.orderRef}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
            {litige?.description}
          </Typography>

          {isClient ? (
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(88,166,255,0.15)', border: '1px solid #58a6ff' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'primary.main', mb: 0.5 }}>
                CLIENT · {litige?.wilaya}
              </Typography>
              <Typography sx={{ fontSize: 14, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'primary.main' }}>
                {litige ? fmtPhone(litige.customerPhone) : '—'}
              </Typography>
              <Button
                size="small"
                component="a"
                href={`tel:${litige?.customerPhone}`}
                sx={{ mt: 1, textTransform: 'none', fontWeight: 600, fontSize: 12, color: 'primary.main' }}
              >
                Appeler maintenant
              </Button>
            </Box>
          ) : (
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(210,153,34,0.15)', border: '1px solid #d29922' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'warning.main', mb: 0.5 }}>
                CARRIER
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'warning.main' }}>
                {litige?.carrier}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#BF360C', mt: 0.5, fontFamily: 'JetBrains Mono, monospace' }}>
                {litige?.trackingNumber}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>
                Contactez le support carrier en fournissant le numéro de suivi ci-dessus.
              </Typography>
            </Box>
          )}

          {litige?.assignedTo && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              Assigné à : <strong>{litige.assignedTo}</strong>
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main tab component ────────────────────────────────────────────────────────

export default function RetoursLitigesTab() {
  const { data: response, isLoading, isError } = useOMSRetours();
  const data = response?.data;

  // ── Panel state ──────────────────────────────────────────────────────────────
  const [drawerOrderId,  setDrawerOrderId]  = useState<string | null>(null);
  const [suivreTarget,   setSuivreTarget]   = useState<RetourItem | null>(null);
  const [contactTarget,  setContactTarget]  = useState<LitigeItem | null>(null);

  if (isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Impossible de charger les retours et litiges. Veuillez réessayer.
      </Alert>
    );
  }

  return (
    <Box>
      {/* ── Section 1: Retours en cours ─────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <ReplayOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="overline" sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>
          {isLoading
            ? <Skeleton variant="text" width={200} />
            : `RETOURS EN COURS — ${data?.totalRetours ?? 0} ARTICLES`}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, mb: 2.5, borderRadius: 2, backgroundColor: 'rgba(210,153,34,0.12)', border: '1px solid #d29922' }}>
        <WarningAmberRoundedIcon sx={{ fontSize: 20, color: 'warning.main', flexShrink: 0 }} />
        <Typography sx={{ fontSize: 13, color: '#5D4037', lineHeight: 1.5 }}>
          Les retours sont placés en quarantaine dans l&apos;inventaire.
          Inspection requise avant réintégration ou perte définitive.
        </Typography>
      </Box>

      <RetoursTable
        retours={data?.retours ?? []}
        isLoading={isLoading}
        onViewOrder={(id) => setDrawerOrderId(id)}
        onSuivre={(r)     => setSuivreTarget(r)}
      />

      {/* ── Section 2: Litiges ouverts ──────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 2 }}>
        <GavelOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="overline" sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>
          {isLoading
            ? <Skeleton variant="text" width={160} />
            : `LITIGES OUVERTS — ${data?.totalLitiges ?? 0}`}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      ) : !data?.litiges?.length ? (
        <Box sx={{ py: 5, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <GavelOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Aucun litige ouvert.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: `repeat(${Math.min(data.litiges.length, 3)}, 1fr)` }, gap: 2.5 }}>
          {data.litiges.map((litige) => (
            <LitigeCard
              key={litige.id}
              litige={litige}
              onViewOrder={(id) => setDrawerOrderId(id)}
              onContact={(l)   => setContactTarget(l)}
            />
          ))}
        </Box>
      )}

      {/* ── Panels ──────────────────────────────────────────── */}
      <OrderDetailDrawer orderId={drawerOrderId} onClose={() => setDrawerOrderId(null)} />
      <SuiviDialog       retour={suivreTarget}   onClose={() => setSuivreTarget(null)} />
      <ContactDialog     litige={contactTarget}  onClose={() => setContactTarget(null)} />
    </Box>
  );
}
