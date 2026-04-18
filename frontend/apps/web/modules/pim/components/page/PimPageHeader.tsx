import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import AddIcon from '@mui/icons-material/Add';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Box, Button, Stack, Typography } from '@mui/material';

interface PimPageHeaderProps {
  total: number;
  onExport: () => void;
  onOpenCreate: () => void;
  onOpenOcr: () => void;
}

export default function PimPageHeader({
  total,
  onExport,
  onOpenCreate,
  onOpenOcr,
}: PimPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', lg: 'center' }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Produits (PIM)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {total} produits geres - Mock BFF dynamique pret pour tests UI.
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
        <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={onExport}>
          Exporter
        </Button>
        <Button variant="outlined" startIcon={<SyncAltIcon />} onClick={onOpenOcr}>
          Importer via OCR
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenCreate}>
          Nouveau Produit
        </Button>
      </Stack>
    </Stack>
  );
}
