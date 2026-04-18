
import { Box, Skeleton, Stack } from '@mui/material';
export default function PimLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box><Skeleton variant="text" width={200} height={38} /><Skeleton variant="text" width={480} height={20} /></Box>
        <Stack direction="row" spacing={1.5}><Skeleton variant="rounded" width={90} height={36} /><Skeleton variant="rounded" width={130} height={36} /><Skeleton variant="rounded" width={150} height={36} /><Skeleton variant="rounded" width={150} height={36} /></Stack>
      </Stack>
      <Stack direction="row" spacing={2} mb={3}>{[1,2,3,4,5].map(i=><Skeleton key={i} variant="rounded" height={80} sx={{ flex: 1 }} />)}</Stack>
      <Stack direction="row" spacing={1.5} mb={2}><Skeleton variant="rounded" height={38} sx={{ flex: 1 }} /><Skeleton variant="rounded" width={160} height={38} /><Skeleton variant="rounded" width={150} height={38} /><Skeleton variant="rounded" width={170} height={38} /></Stack>
      <Skeleton variant="rounded" height={52} sx={{ mb: 0.5 }} />
      {Array.from({length:8}).map((_,i)=><Skeleton key={i} variant="rounded" height={72} sx={{ mb: 0.5 }} />)}
    </Box>
  );
}
