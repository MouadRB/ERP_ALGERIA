import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface InventoryMetricCardProps {
  accent: string;
  helper?: string;
  icon: ReactNode;
  subtitle: string;
  title: string;
}

export default function InventoryMetricCard({
  accent,
  helper,
  icon,
  subtitle,
  title,
}: InventoryMetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        borderRadius: 4,
        p: 2.2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        borderLeft: `4px solid ${accent}`,
        boxShadow: 'none',
        backgroundImage: 'none',
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 999,
            bgcolor: alpha(accent, 0.15),
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
        {helper ? (
          <Typography variant="caption" sx={{ color: accent, fontWeight: 700 }}>
            {helper}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
