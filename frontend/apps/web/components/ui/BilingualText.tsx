'use client';

import { Typography } from '@mui/material';
import { useLocale } from 'next-intl';

type BilingualTextProps = {
  fr: string;
  ar: string;
  variant?: React.ComponentProps<typeof Typography>['variant'];
};

export default function BilingualText({
  fr,
  ar,
  variant = 'body2',
}: BilingualTextProps) {
  const locale = useLocale();
  return (
    <Typography variant={variant} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {locale === 'ar' ? ar : fr}
    </Typography>
  );
}