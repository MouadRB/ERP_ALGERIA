'use client';

import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';
import type { OrderState } from '@ferza/shared';
import { useLocale } from 'next-intl';

// ─── Color per semantic group ─────────────────────────────────────────────────
const STATUS_COLOR: Record<OrderState, ChipProps['color']> = {
  Draft:                   'default',
  AwaitingValidation:      'warning',
  Confirmed:               'info',
  AwaitingPickup:          'info',
  HandedToCarrier:         'primary',
  OutForDelivery:          'primary',
  DeliveredCOD_Confirmed:  'success',
  COD_Remitted:            'success',
  DeliveryFailed_Absent:   'error',
  ReturnInTransit_Refused: 'error',
  LostInTransit:           'error',
  Returned:                'warning',
  Cancelled:               'default',
};

// ─── Bilingual labels ─────────────────────────────────────────────────────────
export const STATUS_LABEL: Record<OrderState, { fr: string; ar: string }> = {
  Draft:                   { fr: 'Brouillon',        ar: 'مسودة' },
  AwaitingValidation:      { fr: 'En attente',        ar: 'في الانتظار' },
  Confirmed:               { fr: 'Confirmée',          ar: 'مؤكدة' },
  AwaitingPickup:          { fr: 'Att. enlèvement',   ar: 'انتظار الاستلام' },
  HandedToCarrier:         { fr: 'Chez carrier',      ar: 'مع الناقل' },
  OutForDelivery:          { fr: 'En livraison',      ar: 'في التوصيل' },
  DeliveredCOD_Confirmed:  { fr: 'Livré — COD',       ar: 'تم التوصيل' },
  COD_Remitted:            { fr: 'COD remis',         ar: 'COD محوّل' },
  DeliveryFailed_Absent:   { fr: 'Echec livraison',   ar: 'فشل التوصيل' },
  ReturnInTransit_Refused: { fr: 'Retour refusé',     ar: 'إرجاع مرفوض' },
  LostInTransit:           { fr: 'Perdu en transit',  ar: 'مفقود' },
  Returned:                { fr: 'Retournée',          ar: 'مُرجَعة' },
  Cancelled:               { fr: 'Annulée',            ar: 'ملغاة' },
};

// ─── Component ────────────────────────────────────────────────────────────────
type Props = {
  status: OrderState;
  size?:  ChipProps['size'];
};

export default function OrderStatusChip({ status, size = 'small' }: Props) {
  const locale = useLocale();
  const label  = locale === 'ar'
    ? STATUS_LABEL[status].ar
    : STATUS_LABEL[status].fr;

  return (
    <Chip
      label={label}
      color={STATUS_COLOR[status]}
      size={size}
      sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
    />
  );
}