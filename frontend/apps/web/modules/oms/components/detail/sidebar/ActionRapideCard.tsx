'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Button } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignCarrierModal from '../../modals/AssignCarrierModal';

interface ActionRapideCardProps { order: any; }

export default function ActionRapideCard({ order }: ActionRapideCardProps) {
  const [assignOpen, setAssignOpen] = useState(false);

  return (
    <>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, backgroundColor: 'rgba(88,166,255,0.15)', borderBottom: '1px solid #58a6ff' }}>
          <Typography variant="overline" sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'primary.main' }}>
            ACTION RAPIDE
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
            Cette commande est confirmée. Assignez un carrier pour lancer l&apos;expédition.
          </Typography>
          <Button fullWidth variant="contained" startIcon={<LocalShippingOutlinedIcon />}
            onClick={() => setAssignOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
            Assigner un carrier
          </Button>
        </Box>
      </Paper>
      <AssignCarrierModal open={assignOpen} onClose={() => setAssignOpen(false)} orderId={order.id} />
    </>
  );
}
