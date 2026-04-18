import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';

interface InventoryPageHeaderProps {
  movementDisabled: boolean;
  totalVariants: number;
  onExportCsv: () => void;
  onExportReport: () => void;
  onOpenMovement: () => void;
  onOpenPhysical: () => void;
}

export default function InventoryPageHeader({
  movementDisabled,
  totalVariants,
  onExportCsv,
  onExportReport,
  onOpenMovement,
  onOpenPhysical,
}: InventoryPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', xl: 'row' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 2.5 }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ color: 'text.primary' }}>
          Inventaire
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {totalVariants.toLocaleString('fr-DZ')} references - Entrepot Alger - Valorisation FIFO
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={0.85}
        sx={{ alignSelf: { xl: 'flex-start' } }}
      >
        <Button
          size="small"
          startIcon={<InsightsOutlinedIcon />}
          onClick={onExportReport}
          sx={{ borderRadius: 999, color: 'text.secondary', px: 1.25, minHeight: 34 }}
        >
          Rapport de Stock
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={onExportCsv}
          sx={{ borderRadius: 999, px: 1.25, minHeight: 34 }}
        >
          Exporter
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<InventoryOutlinedIcon />}
          onClick={onOpenPhysical}
          sx={{ borderRadius: 999, px: 1.25, minHeight: 34 }}
        >
          Inventaire Physique
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onOpenMovement}
          disabled={movementDisabled}
          sx={{ borderRadius: 999, px: 1.35, minHeight: 34 }}
        >
          Mouvement de Stock
        </Button>
      </Stack>
    </Stack>
  );
}
