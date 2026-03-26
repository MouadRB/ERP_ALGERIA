'use client';

import React from 'react';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OrderStatusChip from '../../queue/OrderStatusChip';

interface OrderSuiviTabProps { order: any; }

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrderSuiviTab({ order }: OrderSuiviTabProps) {
  const t = order.tracking;
  if (!t || !t.carrier) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center' }}>
        <LocalShippingOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
          Aucun carrier assigné. Le suivi sera disponible après assignation.
        </Typography>
      </Paper>
    );
  }

  const events = t.events ?? [];
  const attempts = t.attempts ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Carrier + TRK header */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{t.carrier}</Typography>
          </Box>
          {t.trackingNumber && (
            <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: 'primary.main' }}>
              {t.trackingNumber}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Timeline */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Chronologie
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {events.map((ev: any, idx: number) => {
            const isLast = idx === events.length - 1;
            const isFail = ev.status?.includes('Failed') || ev.status?.includes('Lost');
            return (
              <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                {/* Dot + line */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                  <FiberManualRecordIcon sx={{ fontSize: 12, color: isFail ? '#C62828' : isLast ? 'primary.main' : '#BDBDBD', mt: 0.5 }} />
                  {!isLast && <Box sx={{ width: 2, flex: 1, backgroundColor: '#E0E0E0', my: 0.5 }} />}
                </Box>
                {/* Content */}
                <Box sx={{ pb: isLast ? 0 : 2, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{ev.label}</Typography>
                    {ev.status && <OrderStatusChip status={ev.status} size="small" />}
                  </Box>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>{fmtDate(ev.date)}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Delivery attempts */}
      {attempts.length > 0 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Tentatives de livraison ({attempts.length}/3)
          </Typography>
          {attempts.map((a: any, idx: number) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: idx < attempts.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Tentative {a.attemptNumber}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{fmtDate(a.date)}</Typography>
                {a.note && <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>{a.note}</Typography>}
              </Box>
              <Chip label={a.result} size="small" color={a.result === 'Livré' ? 'success' : a.result === 'En cours' ? 'info' : 'error'} sx={{ fontWeight: 600, fontSize: 11 }} />
            </Box>
          ))}
          {attempts.length >= 2 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5, px: 1, py: 0.75, borderRadius: 1.5, backgroundColor: '#FFEBEE' }}>
              <ErrorOutlineIcon sx={{ fontSize: 14, color: '#C62828' }} />
              <Typography sx={{ fontSize: 11, color: '#C62828', fontWeight: 600 }}>
                {attempts.length >= 3 ? 'Maximum 3 tentatives atteint — retour automatique.' : `${attempts.length}/3 tentatives échouées — risque retour élevé.`}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}