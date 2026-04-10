'use client';

import { Box, Chip, Skeleton, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import type { ReturnRatePoint } from '@/modules/crm/hooks/useCRMAnalytics';

interface Props { data: ReturnRatePoint[]; loading: boolean; }

export default function ReturnRateChart({ data, loading }: Props) {
  if (loading) return <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 1 }} />;

  const current = data[data.length - 1]?.rate ?? 0;
  const avg     = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.rate, 0) / data.length) : 0;
  const peak    = Math.max(...data.map((d) => d.rate));

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>Taux de Retour (4 dernières semaines)</Typography>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="week" />
          <YAxis domain={[0, 40]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v) => [`${v}%`, 'Taux retour']} />
          <ReferenceLine y={30} stroke="#E65100" strokeDasharray="4 2" label={{ value: 'Seuil 30%', fill: '#E65100', fontSize: 11 }} />
          <Line type="monotone" dataKey="rate" stroke="#C62828" strokeWidth={2} dot={<Dot r={4} fill="#C62828" />} />
        </LineChart>
      </ResponsiveContainer>
      <Box display="flex" gap={1} mt={1} flexWrap="wrap">
        <Chip label={`Taux actuel: ${current}%`} size="small" color={current > 30 ? 'error' : 'default'} />
        <Chip label={`Pic: ${peak}%`} size="small" variant="outlined" />
        <Chip label={`Moy: ${avg}%`} size="small" variant="outlined" />
        <Chip label="Objectif: <10%" size="small" color="success" variant="outlined" />
      </Box>
    </Box>
  );
}
