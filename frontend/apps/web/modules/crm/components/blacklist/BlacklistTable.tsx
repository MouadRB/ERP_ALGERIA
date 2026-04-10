'use client';

import {
  Alert, Box, Chip, IconButton, Skeleton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import LockOpenIcon    from '@mui/icons-material/LockOpen';
import OpenInNewIcon   from '@mui/icons-material/OpenInNew';
import type { Customer } from '@ferza/shared';
import { WILAYAS }     from '@ferza/shared';
import { useRouter, useParams } from 'next/navigation';
import { useRemoveFromBlacklist } from '@/modules/crm/hooks/useRemoveFromBlacklist';

const COLUMNS = ['CLIENT', 'TÉLÉPHONE', 'WILAYA', 'MOTIF', 'BLOQUÉ PAR', 'DATE BLOCAGE', 'COMMANDES', 'ACTIONS'];

function relDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props {
  customers: Customer[];
  loading:   boolean;
}

export default function BlacklistTable({ customers, loading }: Props) {
  const router = useRouter();
  const locale = (useParams()?.locale as string | undefined) ?? 'fr';
  const removeFromBlacklist = useRemoveFromBlacklist();

  return (
    <Box>
      <Alert severity="error" sx={{ mb: 2 }}>
        Liste Noire — {customers.length} client(s) bloqué(s). Seul un SuperAdmin peut lever un blocage.
      </Alert>
      <TableContainer sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFF5F5' }}>
              {COLUMNS.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 700, fontSize: 11, color: 'error.main', bgcolor: '#FFF5F5' }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {COLUMNS.map((c) => <TableCell key={c}><Skeleton height={36} /></TableCell>)}
                </TableRow>
              ))
              : customers.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Aucun client en liste noire</Typography>
                  </TableCell>
                </TableRow>
              )
              : customers.map((c) => {
                const wilaya = WILAYAS.find((w) => w.code === c.wilayaCode);
                return (
                  <TableRow key={c.id} sx={{ bgcolor: '#FFF5F5' }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{c.nameFr}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.nameAr}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" fontFamily="monospace">{c.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{wilaya?.name ?? c.wilayaCode}</Typography>
                    </TableCell>
                    <TableCell>
                      {c.blacklistMotif
                        ? <Chip label={c.blacklistMotif} size="small" color="error" variant="outlined" sx={{ fontSize: 10 }} />
                        : <Typography variant="caption" color="text.disabled">—</Typography>
                      }
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{c.blacklistedBy ?? '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{relDate(c.blacklistedAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.totalOrders}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex">
                        <Tooltip title="Voir profil">
                          <IconButton size="small" onClick={() => router.push(`/${locale}/crm/${c.id}`)}>
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lever le blocage (SuperAdmin)">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => removeFromBlacklist.mutate(c.id)}
                            disabled={removeFromBlacklist.isPending}
                          >
                            <LockOpenIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.disabled" mt={1} display="block">
        {customers.length} client(s) en liste noire · SuperAdmin requis pour lever le blocage
      </Typography>
    </Box>
  );
}
