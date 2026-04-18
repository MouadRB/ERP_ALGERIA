'use client';
// apps/web/modules/pim/components/PimStatsBar.tsx
// Design: 5 cartes — Produits actifs / En attente activation / Taux retour ≥30% / Variantes actives / Révision OCR
import { Box, Paper, Typography, Stack } from '@mui/material';
import LocalOfferOutlinedIcon    from '@mui/icons-material/LocalOfferOutlined';
import AccessTimeOutlinedIcon    from '@mui/icons-material/AccessTimeOutlined';
import WarningAmberOutlinedIcon  from '@mui/icons-material/WarningAmberOutlined';
import CategoryOutlinedIcon      from '@mui/icons-material/CategoryOutlined';
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined';

export interface PimStats {
  active: number;
  pending: number;
  highReturn: number;
  variantesActives: number;
  ocrRevision: number;
}

interface CardProps {
  value: number; label: string; icon: React.ReactNode;
  iconColor: string; iconBg: string; valueColor?: string;
  dot?: boolean; dotColor?: string; clickable?: boolean;
}

function Card({ value, label, icon, iconColor, iconBg, valueColor, dot, dotColor, clickable }: CardProps) {
  return (
    <Paper elevation={0} sx={{
      flex: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2,
      cursor: clickable ? 'pointer' : 'default',
      '&:hover': clickable ? { borderColor: '#58a6ff', boxShadow: '0 0 0 1px #58a6ff' } : {},
      position: 'relative', overflow: 'hidden',
    }}>
      {dot && <Box sx={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor ?? '#fd8c73' }} />}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ color: valueColor ?? 'text.primary', lineHeight: 1.1 }}>
            {value.toLocaleString('fr-FR')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function PimStatsBar({ stats }: { stats: PimStats }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
      <Card value={stats.active}          label="Produits actifs"       icon={<LocalOfferOutlinedIcon fontSize="small" />}     iconBg="rgba(88,166,255,0.15)" iconColor="#58a6ff" />
      <Card value={stats.pending}         label="En attente d'activation" icon={<AccessTimeOutlinedIcon fontSize="small" />}   iconBg="rgba(253,140,115,0.08)" iconColor="#fd8c73" valueColor="#fd8c73" dot dotColor="#fd8c73" />
      <Card value={stats.highReturn}      label="Taux retour ≥ 30%"    icon={<WarningAmberOutlinedIcon fontSize="small" />}    iconBg="#fff1f2" iconColor="#f43f5e" valueColor="#f43f5e" dot dotColor="#f43f5e" />
      <Card value={stats.variantesActives} label="Variantes actives"    icon={<CategoryOutlinedIcon fontSize="small" />}       iconBg="rgba(46,160,67,0.08)" iconColor="#2ea043" />
      <Card value={stats.ocrRevision}     label="Révision OCR requise"  icon={<DocumentScannerOutlinedIcon fontSize="small" />} iconBg="rgba(188,140,255,0.08)" iconColor="#bc8cff" valueColor="#bc8cff" clickable />
    </Stack>
  );
}
