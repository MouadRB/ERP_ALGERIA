import { Box, Skeleton, Stack } from '@mui/material';

export default function InventoryLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={220} height={44} />
      <Skeleton variant="text" width={460} height={22} sx={{ mb: 2 }} />
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={104} sx={{ flex: 1 }} />
        ))}
      </Stack>
      <Skeleton variant="rounded" height={54} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" height={56} sx={{ mb: 2 }} />
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={72} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}
