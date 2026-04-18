import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';

interface CataloguePageHeaderProps {
  onOpenAudit: () => void;
}

export default function CataloguePageHeader({
  onOpenAudit,
}: CataloguePageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Module Catalogue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestion de la publication, visibilite et distribution multi-canal.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        sx={{ alignSelf: { xs: 'stretch', lg: 'flex-start' }, ml: { lg: 'auto' } }}
      >
        <Button
          variant="outlined"
          startIcon={<HistoryEduOutlinedIcon />}
          onClick={onOpenAudit}
          sx={{ borderRadius: 999 }}
        >
          Journal d&apos;Audit
        </Button>
      </Stack>
    </Stack>
  );
}
