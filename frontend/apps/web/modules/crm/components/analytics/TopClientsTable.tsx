'use client';

import {
  Box, Chip, Skeleton, Table, TableBody, TableCell,
  TableHead, TableRow, Typography,
} from '@mui/material';
import { formatDZD, WILAYAS } from '@ferza/shared';
import type { TopClient } from '@/modules/crm/hooks/useCRMAnalytics';
import { SEGMENT_COLOR, SEGMENT_BG } from '@/modules/crm/utils/segmentColors';
import type { CustomerSegment } from '@ferza/shared';

interface Props { data: TopClient[]; loading: boolean; vipCount: number; onShowVIP?: () => void; }

export default function TopClientsTable({ data, loading, vipCount, onShowVIP }: Props) {
  if (loading) return <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 1 }} />;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>Top 10 Clients par CA</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>CLIENT</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>WILAYA</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>CA TOTAL</TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>CMD</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((c, i) => {
            const wilaya = WILAYAS.find((w) => w.code === c.wilayaCode);
            const seg    = c.segment as CustomerSegment;
            return (
              <TableRow key={c.id}>
                <TableCell sx={{ fontWeight: 700, color: i < 3 ? 'warning.main' : undefined }}>{i + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{c.nameFr}</Typography>
                  <Chip label={c.segment} size="small" sx={{ bgcolor: SEGMENT_BG[seg] ?? '#F5F5F5', color: SEGMENT_COLOR[seg] ?? '#757575', fontSize: 9, height: 16 }} />
                </TableCell>
                <TableCell><Typography variant="caption">{wilaya?.name ?? c.wilayaCode}</Typography></TableCell>
                <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={600}>{formatDZD(c.totalSpentTTC)}</Typography></TableCell>
                <TableCell><Typography variant="body2">{c.totalOrders}</Typography></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Typography
        variant="caption"
        color="primary.main"
        mt={1}
        display="block"
        onClick={onShowVIP}
        sx={{ cursor: onShowVIP ? 'pointer' : undefined, '&:hover': onShowVIP ? { textDecoration: 'underline' } : {} }}
      >
        Voir tous les VIP ({vipCount}) →
      </Typography>
    </Box>
  );
}
