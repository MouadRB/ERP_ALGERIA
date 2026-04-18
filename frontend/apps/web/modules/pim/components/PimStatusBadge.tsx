'use client';

import { Box, Typography, alpha, useTheme } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { ProductStatus } from './pim.types';

export default function PimStatusBadge({ status, size = 'small' }: { status: ProductStatus; size?: 'small' | 'medium' }) {
  const theme = useTheme();

  const getStatusConfig = (s: ProductStatus) => {
    switch (s) {
      case 'active':       return { label: 'Actif', colorKey: 'success' as const };
      case 'draft':        return { label: 'Brouillon', colorKey: 'warning' as const };
      case 'discontinued': return { label: 'Discontinué', colorKey: 'error' as const };
      case 'signaled':     return { label: 'Signalé', colorKey: 'warning' as const };
      case 'ocr_import':   return { label: 'Import OCR', colorKey: 'info' as const };
      case 'archived':
      default:             return { label: 'Archivé', colorKey: 'default' as const };
    }
  };

  const config = getStatusConfig(status);

  const getBadgeStyle = () => {
    if (config.colorKey === 'default') {
      return {
        bgcolor: alpha(theme.palette.text.secondary, 0.12),
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
        iconColor: theme.palette.text.secondary,
      };
    }

    const mainColor = theme.palette[config.colorKey].main;

    return {
      bgcolor: alpha(mainColor, 0.15),
      border: `1px solid ${mainColor}`,
      color: mainColor,
      iconColor: mainColor,
    };
  };

  const styles = getBadgeStyle();

  return (
    <Box 
      sx={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: 0.5, 
        px: 1, 
        py: 0.25, 
        borderRadius: '2rem', 
        border: styles.border,
        bgcolor: styles.bgcolor,
      }}
    >
      {status === 'active' && (
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: styles.iconColor, flexShrink: 0 }} />
      )}
      {status === 'signaled' && <WarningAmberIcon sx={{ fontSize: 13, color: styles.iconColor }} />}
      <Typography 
        variant="caption" 
        fontWeight={600} 
        sx={{ 
          color: styles.color, 
          fontSize: size === 'small' ? '0.68rem' : '0.75rem', 
          lineHeight: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '0.02em'
        }}
      >
        {config.label}
      </Typography>
    </Box>
  );
}