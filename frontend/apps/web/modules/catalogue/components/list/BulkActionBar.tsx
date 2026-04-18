'use client';

import { Box, Button, Slide, Stack, Typography } from '@mui/material';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';

type BulkActionBarProps = {
  count: number;
  onClear: () => void;
  onExport: () => void;
  onMask: () => void;
  onPublish: () => void;
  onSchedule: () => void;
};

export default function BulkActionBar({
  count,
  onClear,
  onExport,
  onMask,
  onPublish,
  onSchedule,
}: BulkActionBarProps) {
  return (
    <Slide in={count > 0} direction="up" mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          left: { xs: 12, lg: 236 },
          right: 12,
          bottom: 24,
          zIndex: 1400,
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between"
          sx={{
            bgcolor: 'text.primary',
            color: '#fff',
            borderRadius: 4,
            px: 2.25,
            py: 1.75,
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.35)',
          }}
        >
          <Typography fontWeight={700} sx={{ color: 'primary.main' }}>
            {count} produits selectionnes
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
            <Button
              color="inherit"
              startIcon={<PublishOutlinedIcon />}
              onClick={onPublish}
              sx={{ bgcolor: 'rgba(37, 99, 235, 0.22)', borderRadius: 999, px: 1.5 }}
            >
              Publier
            </Button>
            <Button
              color="inherit"
              startIcon={<VisibilityOffOutlinedIcon />}
              onClick={onMask}
              sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', borderRadius: 999, px: 1.5 }}
            >
              Masquer
            </Button>
            <Button
              color="inherit"
              startIcon={<EventOutlinedIcon />}
              onClick={onSchedule}
              sx={{ bgcolor: 'rgba(139, 92, 246, 0.15)', borderRadius: 999, px: 1.5 }}
            >
              Planifier
            </Button>
            <Button
              color="inherit"
              startIcon={<UploadOutlinedIcon />}
              onClick={onExport}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 999, px: 1.5 }}
            >
              Exporter
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onClear}
              sx={{ borderColor: 'rgba(255,255,255,0.28)' }}
            >
              Fermer
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Slide>
  );
}
