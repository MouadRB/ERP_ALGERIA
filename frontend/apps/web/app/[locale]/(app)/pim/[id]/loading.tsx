// apps/web/app/[locale]/(app)/pim/[id]/loading.tsx
import { Box, Skeleton, Stack, Grid } from '@mui/material';
export default function PimDetailLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: 1.5 }} />
          <Box><Skeleton width={260} height={32} /><Skeleton width={180} height={20} /><Skeleton width={320} height={20} /></Box>
        </Stack>
        <Stack direction="row" spacing={1}><Skeleton variant="rounded" width={130} height={36} /><Skeleton variant="rounded" width={36} height={36} /></Stack>
      </Stack>
      <Skeleton width={380} height={22} sx={{ mb: 2.5 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8.5}><Stack direction="row" spacing={1} mb={3}>{[1,2,3,4,5].map(i=><Skeleton key={i} variant="rounded" width={120} height={36} />)}</Stack><Skeleton variant="rounded" height={480} /></Grid>
        <Grid item xs={12} md={3.5}><Skeleton variant="rounded" height={200} sx={{ mb: 2 }} /><Skeleton variant="rounded" height={180} sx={{ mb: 2 }} /><Skeleton variant="rounded" height={160} /></Grid>
      </Grid>
    </Box>
  );
}
