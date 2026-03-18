'use client';

import { Typography } from '@mui/material';
import { formatPhone, getOperator } from '@ferza/shared';

type PhoneDisplayProps = {
  phone: string;
  showOperator?: boolean;
};

export default function PhoneDisplay({ phone, showOperator = false }: PhoneDisplayProps) {
  const formatted = formatPhone(phone);
  const operator = showOperator ? getOperator(phone) : null;

  return (
    <Typography variant="body2" component="span" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {formatted}
      {operator && operator !== 'Unknown' && (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ ml: 0.75 }}
        >
          ({operator})
        </Typography>
      )}
    </Typography>
  );
}