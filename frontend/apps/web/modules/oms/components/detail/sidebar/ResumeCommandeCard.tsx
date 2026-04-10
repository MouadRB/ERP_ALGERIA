'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ConfirmOrderModal from '../../modals/ConfirmOrderModal';
import CancelOrderModal from '../../modals/CancelOrderModal';
import AssignCarrierModal from '../../modals/AssignCarrierModal';

interface ResumeCommandeCardProps { order: any; }

const TERMINAL = ['DeliveredCOD_Confirmed', 'COD_Remitted', 'Returned', 'Cancelled', 'LostInTransit'];
const PRE_CARRIER = ['Draft', 'AwaitingValidation', 'Confirmed', 'AwaitingPickup'];

export default function ResumeCommandeCard({ order }: ResumeCommandeCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const isTerminal = TERMINAL.includes(order.status);
  const canConfirm = order.status === 'AwaitingValidation';
  const canCancel = PRE_CARRIER.includes(order.status) && !isTerminal;
  const canAssign = order.status === 'Confirmed';

  const totalFormatted = new Intl.NumberFormat('fr-DZ', { style: 'decimal' }).format(order.totalTTC ?? order.codAmount ?? 0);

  return (
    <>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, backgroundColor: '#F8FAFC' }}>
          <Typography variant="overline" sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary' }}>
            RÉSUMÉ COMMANDE
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Total amount */}
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: 24, color: 'text.primary' }}>
              {totalFormatted} DZD
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Montant COD</Typography>
          </Box>

          {/* Items count */}
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
            {order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? 's' : ''}
          </Typography>

          <Divider />

          {/* Action buttons */}
          {canConfirm && (
            <Button fullWidth variant="contained" color="primary" startIcon={<CheckCircleOutlineIcon />}
              onClick={() => setConfirmOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
              Confirmer la commande
            </Button>
          )}
          {canAssign && (
            <Button fullWidth variant="outlined" color="primary" startIcon={<LocalShippingOutlinedIcon />}
              onClick={() => setAssignOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
              Assigner un carrier
            </Button>
          )}
          {canCancel && (
            <Button fullWidth variant="outlined" color="error" startIcon={<CancelOutlinedIcon />}
              onClick={() => setCancelOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
              Annuler la commande
            </Button>
          )}
          {isTerminal && (
            <Typography sx={{ fontSize: 12, color: 'text.disabled', textAlign: 'center', fontStyle: 'italic' }}>
              Commande terminée — aucune action disponible.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Modals */}
      <ConfirmOrderModal open={confirmOpen} onClose={() => setConfirmOpen(false)} orderId={order.id} />
    <CancelOrderModal open={cancelOpen} onClose={() => setCancelOpen(false)} orderId={order.id} />
      <AssignCarrierModal open={assignOpen} onClose={() => setAssignOpen(false)} orderId={order.id} />
    </>
  );
}
