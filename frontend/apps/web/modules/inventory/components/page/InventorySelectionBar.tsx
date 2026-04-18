import { Button, Paper, Stack, Tooltip, Typography } from '@mui/material';

interface InventorySelectionBarProps {
  count: number;
  onGroupMovement: () => void;
}

export default function InventorySelectionBar({
  count,
  onGroupMovement,
}: InventorySelectionBarProps) {
  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        left: { xs: 16, lg: 220 },
        right: 24,
        bottom: 18,
        zIndex: 1200,
        borderRadius: 3.5,
        bgcolor: 'primary.main',
        color: '#fff',
        px: 1.5,
        py: 1.1,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <Typography fontWeight={800}>{count} articles selectionnes</Typography>
        <Button
          variant="outlined"
          onClick={onGroupMovement}
          sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)', borderRadius: 2.5 }}
        >
          Mouvement Groupe
        </Button>
        <Tooltip title="Disponible apres implementation du module Bon de Commande">
          <span>
            <Button
              variant="outlined"
              disabled
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.35)',
                borderRadius: 2.5,
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              Creer Bon de Commande
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
