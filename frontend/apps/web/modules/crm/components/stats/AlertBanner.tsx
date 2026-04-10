'use client';

import * as React from 'react';
import { Alert, Box, Button, IconButton, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon        from '@mui/icons-material/Close';
import type { CRMStats } from '@/modules/crm/hooks/useCRMStats';

interface Props {
  stats:    CRMStats | null;
  onViewAlerts?: () => void;
}

export default function AlertBanner({ stats, onViewAlerts }: Props) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed || !stats) return null;

  const hasBlacklistAttempts = stats.blacklistedCount > 0;
  const hasEscalations       = stats.escalatedCount   > 0;

  if (!hasBlacklistAttempts && !hasEscalations) return null;

  const parts: string[] = [];
  if (hasBlacklistAttempts) parts.push(`${stats.blacklistedCount} client(s) en liste noire`);
  if (hasEscalations)       parts.push(`${stats.escalatedCount} ticket(s) escaladé(s)`);

  return (
    <Alert
      severity="warning"
      icon={<WarningAmberIcon />}
      sx={{ mb: 2, alignItems: 'center' }}
      action={
        <Box display="flex" alignItems="center" gap={1}>
          {onViewAlerts && (
            <Button size="small" color="warning" onClick={onViewAlerts}>
              Voir alertes
            </Button>
          )}
          <IconButton size="small" onClick={() => setDismissed(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      }
    >
      <Typography variant="body2" fontWeight={600}>
        {parts.join(' · ')}
      </Typography>
    </Alert>
  );
}
