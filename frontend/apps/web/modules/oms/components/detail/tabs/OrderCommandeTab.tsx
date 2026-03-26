'use client';

import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Divider } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SourceOutlinedIcon from '@mui/icons-material/SourceOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';

interface OrderCommandeTabProps { order: any; }

export default function OrderCommandeTab({ order }: OrderCommandeTabProps) {
  const items = order.items ?? [];
  const fmt = (v: number) => new Intl.NumberFormat('fr-DZ').format(v);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Items table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F8FAFC', '& th': { fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', color: 'text.secondary', textTransform: 'uppercase', py: 1.5 } }}>
              <TableCell>SKU</TableCell>
              <TableCell>NOM PRODUIT</TableCell>
              <TableCell align="center">QTÉ</TableCell>
              <TableCell align="right">PRIX UNIT. TTC</TableCell>
              <TableCell align="right">TOTAL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item: any, idx: number) => (
              <TableRow key={idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'text.secondary' }}>{item.sku}</Typography>
                </TableCell>
                <TableCell><Typography sx={{ fontSize: 13 }}>{item.nameFr}</Typography></TableCell>
                <TableCell align="center"><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{item.qty}</Typography></TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{fmt(item.prixUnitTTC)} DZD</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700 }}>{fmt(item.total)} DZD</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info cards row */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Delivery address */}
        <InfoBlock icon={<LocationOnOutlinedIcon />} label="Adresse de livraison"
          value={order.address ?? '—'} sub={order.commune ? `Commune: ${order.commune}` : undefined} />

        {/* Source channel */}
        <InfoBlock icon={<SourceOutlinedIcon />} label="Canal source"
          value={order.source ?? '—'} chip />

        {/* Internal note */}
        {order.noteInterne && (
          <InfoBlock icon={<NoteAltOutlinedIcon />} label="Note interne" value={order.noteInterne} />
        )}
      </Box>
    </Box>
  );
}

function InfoBlock({ icon, label, value, sub, chip }: { icon: React.ReactNode; label: string; value: string; sub?: string; chip?: boolean }) {
  return (
    <Paper elevation={0} sx={{ flex: 1, minWidth: 200, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1, color: 'text.secondary' }}>
        {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 16 } })}
        <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
      </Box>
      {chip ? (
        <Chip label={value} size="small" sx={{ fontWeight: 600, fontSize: 12 }} />
      ) : (
        <Typography sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.5 }}>{value}</Typography>
      )}
      {sub && <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>{sub}</Typography>}
    </Paper>
  );
}