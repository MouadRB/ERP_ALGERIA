'use client';

import { Box, Card, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import type { Customer } from '@ferza/shared';
import { WILAYAS } from '@ferza/shared';
import { SEGMENT_COLOR, SEGMENT_BG, SEGMENT_ICON, RISK_COLOR } from '@/modules/crm/utils/segmentColors';

interface Props { customer: Customer; }

export default function ProfilResumeCard({ customer }: Props) {
  const wilaya   = WILAYAS.find((w) => w.code === customer.wilayaCode);
  const segColor = SEGMENT_COLOR[customer.segment] ?? '#757575';
  const segBg    = SEGMENT_BG[customer.segment]    ?? '#F5F5F5';
  const segIcon  = SEGMENT_ICON[customer.segment]  ?? '';
  const fraud    = customer.fraudScore ?? 0;

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
          Profil Résumé
        </Typography>

        {/* Segment */}
        <Box mt={1} mb={1}>
          <Chip label={`${segIcon} ${customer.segment}`} size="small"
            sx={{ bgcolor: segBg, color: segColor, fontWeight: 700 }} />
        </Box>

        {/* Location */}
        <Typography variant="body2" color="text.secondary">
          {wilaya?.name ?? customer.wilayaCode}
          {customer.commune ? ` · ${customer.commune}` : ''}
        </Typography>

        {/* Fraud score */}
        <Box mt={1.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" fontWeight={600}>Score Risque</Typography>
            <Typography variant="caption" fontFamily="monospace" color={RISK_COLOR[customer.riskLevel]}>
              {fraud}/100
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={fraud}
            color={fraud > 70 ? 'error' : fraud > 40 ? 'warning' : 'success'}
            sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
          />
        </Box>

        {/* Member since */}
        <Typography variant="caption" color="text.disabled" mt={1} display="block">
          Client depuis: {new Date(customer.createdAt).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Typography>
      </CardContent>
    </Card>
  );
}
