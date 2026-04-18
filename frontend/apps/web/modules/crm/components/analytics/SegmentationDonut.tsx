'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { SegmentPoint } from '@/modules/crm/hooks/useCRMAnalytics';

const COLORS: Record<string, string> = {
  'VIP':         '#d29922',
  'Fidèle':      '#58a6ff',
  'Nouveau':     '#2ea043',
  'Inactif':     '#9E9E9E',
  'A risque':    '#f85149',
  'Liste noire': '#bc8cff',
};

interface Props {
  data:         SegmentPoint[];
  totalClients: number;
  loading:      boolean;
}

export default function SegmentationDonut({ data, totalClients, loading }: Props) {
  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />;

  // Hide slices with zero clients so legend/labels don't show empty segments.
  const visible = data.filter((d) => d.count > 0);

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>Segmentation Clients</Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={visible}
            dataKey="count"
            nameKey="segment"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            label={({ segment, count }) => `${segment}: ${count}`}
            labelLine={false}
          >
            {visible.map((entry) => (
              <Cell key={entry.segment} fill={COLORS[entry.segment] ?? '#8b949e'} />
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
