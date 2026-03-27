'use client';

import { Alert, Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import BlockIcon    from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import type { Customer } from '@ferza/shared';
import { useRemoveFromBlacklist } from '@/modules/crm/hooks/useRemoveFromBlacklist';

interface Props {
  customer:    Customer;
  onBlacklist: () => void;
}

export default function ZoneDangerCard({ customer, onBlacklist }: Props) {
  const removeFromBlacklist = useRemoveFromBlacklist();

  return (
    <Card variant="outlined" sx={{ mb: 2, borderColor: 'error.light' }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant="caption" fontWeight={700} color="error.main" textTransform="uppercase" letterSpacing={0.5}>
          Zone Danger
        </Typography>

        {customer.blacklisted ? (
          <Box mt={1}>
            <Alert severity="error" sx={{ py: 0.5, mb: 1 }}>
              <Typography variant="caption" fontWeight={700}>CLIENT BLACKLISTÉ</Typography>
              {customer.blacklistMotif && (
                <Chip label={customer.blacklistMotif} size="small" color="error" sx={{ mt: 0.5, fontSize: 10, display: 'block' }} />
              )}
            </Alert>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Bloqué le {customer.blacklistedAt
                ? new Date(customer.blacklistedAt).toLocaleDateString('fr-DZ')
                : '—'} par {customer.blacklistedBy ?? '—'}
            </Typography>
            <Button
              fullWidth variant="outlined" color="success" size="small"
              startIcon={<LockOpenIcon />}
              onClick={() => removeFromBlacklist.mutate(customer.id)}
              disabled={removeFromBlacklist.isPending}
            >
              Lever le blocage
            </Button>
          </Box>
        ) : (
          <Box mt={1}>
            <Button
              fullWidth variant="outlined" color="error" size="small"
              startIcon={<BlockIcon />}
              onClick={onBlacklist}
            >
              Ajouter à la Blacklist
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
