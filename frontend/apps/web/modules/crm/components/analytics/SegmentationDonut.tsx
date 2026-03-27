'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { SegmentPoint } from '@/modules/crm/hooks/useCRMAnalytics';

const COLORS: Record<string, string> = {
  'VIP':         '#E65100',
  'Fidèle':      '#1565C0',
  'Nouveau':     '#2E7D32',
  'Inactif':     '#9E9E9E',
  'A risque':    '#C62828',
  'Liste noire': '#6A1B9A',
};

interface Props {
  data:         SegmentPoint[];
  totalClients: number;
  loading:      boolean;
}

export default function SegmentationDonut({ data, totalClients, loading }: Props) {
  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>Segmentation Clients</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="segment"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            label={({ segment, count }) => `${segment}: ${count}`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell key={entry.segment} fill={COLORS[entry.segment] ?? '#757575'} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary" align="center" display="block">
        {totalClients} clients total
      </Typography>
    </Box>
  );
}
