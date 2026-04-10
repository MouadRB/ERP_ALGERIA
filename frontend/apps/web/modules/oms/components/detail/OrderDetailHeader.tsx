'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import OrderStatusChip from '../queue/OrderStatusChip';
import { getWilayaByCode } from '@ferza/shared';

interface OrderDetailHeaderProps {
  order: any;
}

/** Simple countdown display — counts down to autoCancelAt ISO string */
function CountdownDisplay({ autoCancelAt }: { autoCancelAt: string }) {
  const [remaining, setRemaining] = React.useState('');
  const [isUrgent, setIsUrgent] = React.useState(false);

  React.useEffect(() => {
    const update = () => {
      const ms = new Date(autoCancelAt).getTime() - Date.now();
      if (ms <= 0) { setRemaining('Expiré'); setIsUrgent(true); return; }
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setRemaining(`${min}min ${sec < 10 ? '0' : ''}${sec}s restant`);
      setIsUrgent(min < 30);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [autoCancelAt]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <AccessTimeIcon sx={{ fontSize: 16, color: isUrgent ? 'error.main' : 'warning.main' }} />
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: isUrgent ? 'error.main' : 'warning.main' }}>
        {remaining}
      </Typography>
    </Box>
  );
}

export default function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  const wilayaName = order.wilayaCode
    ? getWilayaByCode(order.wilayaCode)?.name ?? order.customer?.wilaya ?? order.wilayaCode
    : '';
  const wilayaLabel = order.wilayaCode ? `${wilayaName} (${order.wilayaCode})` : '';

  return (
    <Box>
      {/* Reference */}
      <Typography
        sx={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 800,
          fontSize: 22,
          color: 'primary.main',
          mb: 1,
        }}
      >
        #{order.reference}
      </Typography>

      {/* Status row: chip + timer + wilaya */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <OrderStatusChip status={order.status} size="small" />

        {order.status === 'AwaitingValidation' && order.autoCancelAt && (
          <CountdownDisplay autoCancelAt={order.autoCancelAt} />
        )}

        {wilayaLabel && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{wilayaLabel}</Typography>
          </Box>
        )}

        {order.carrier && (
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Carrier: <strong>{order.carrier}</strong>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
