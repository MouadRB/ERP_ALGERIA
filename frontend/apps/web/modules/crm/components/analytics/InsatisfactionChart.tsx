'use client';

import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { InsatisfactionReason } from '@/modules/crm/hooks/useCRMAnalytics';

const COLORS = ['#f85149', '#d29922', '#F57F17', '#58a6ff', '#bc8cff'];

interface Props { data: InsatisfactionReason[]; loading: boolean; }

export default function InsatisfactionChart({ data, loading }: Props) {
  if (loading) return <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 1 }} />;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>Top 5 Raisons d'Insatisfaction</Typography>
      <Alert severity="warning" sx={{ mb: 1, py: 0.5 }}>
        Taux de retour élevé détecté — analyse produits recommandée
      </Alert>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 160 }}>
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="reason" width={155} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 3, 3, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Button size="small" variant="outlined" color="warning" sx={{ mt: 1 }}>
        Signaler à PIM Manager
      </Button>
    </Box>
  );
}
