import { Box, Skeleton, Stack } from '@mui/material';

export default function CatalogueDetailLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={180} height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={180} sx={{ mb: 3 }} />
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Box sx={{ flex: 2 }}>
          <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={420} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rounded" height={180} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={180} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={180} />
        </Box>
      </Stack>
    </Box>
  );
}
