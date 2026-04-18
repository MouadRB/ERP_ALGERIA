'use client';

import {
  Box,
  LinearProgress,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { WilayaDelivery } from '@/modules/crm/hooks/useCRMAnalytics';
import { WILAYAS } from '@ferza/shared';

interface Props { data: WilayaDelivery[]; loading: boolean; }

export default function WilayaDeliveryChart({ data, loading }: Props) {
  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />;

  const rows = data.map((d) => ({
    ...d,
    name: WILAYAS.find((w) => w.code === d.wilayaCode)?.name ?? d.wilayaCode,
  }));

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Taux de Livraison par Wilaya (Top 10)
      </Typography>
      <Table size="small" sx={{ '& td, & th': { py: 0.5, fontSize: 11 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>WILAYA</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '55%' }}>TAUX</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>%</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => {
            const ok = r.deliveryRate >= 50;
            return (
              <TableRow key={r.wilayaCode}>
                <TableCell>{r.name}</TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, r.deliveryRate))}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: ok ? '#2ea043' : '#d29922',
                      },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, textAlign: 'right', color: ok ? '#2ea043' : '#d29922' }}>
                  {r.deliveryRate}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Typography variant="caption" color="text.secondary" mt={1} display="block">
        Wilayas sud: taux de livraison plus bas — Carrier: Procolis recommandé
      </Typography>
    </Box>
  );
}
