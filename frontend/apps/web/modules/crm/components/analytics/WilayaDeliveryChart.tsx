'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { WilayaDelivery } from '@/modules/crm/hooks/useCRMAnalytics';
import { WILAYAS } from '@ferza/shared';

interface Props { data: WilayaDelivery[]; loading: boolean; }

export default function WilayaDeliveryChart({ data, loading }: Props) {
  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />;

  const enriched = data.map((d) => ({
    ...d,
    name: WILAYAS.find((w) => w.code === d.wilayaCode)?.name ?? d.wilayaCode,
  }));

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>Taux de Livraison par Wilaya (Top 10)</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={enriched} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v}%`, 'Taux livraison']} />
          <Bar dataKey="deliveryRate" radius={[0, 3, 3, 0]}>
            {enriched.map((entry) => (
              <Cell key={entry.wilayaCode} fill={entry.deliveryRate >= 50 ? '#2E7D32' : '#E65100'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary">
        Wilayas sud: taux de livraison plus bas — Carrier: Procolis recommandé
      </Typography>
    </Box>
  );
}
