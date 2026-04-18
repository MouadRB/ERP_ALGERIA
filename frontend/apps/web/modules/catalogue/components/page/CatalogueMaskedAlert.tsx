import { Alert, Button, Typography } from '@mui/material';

interface CatalogueMaskedAlertProps {
  maskedCount: number;
  onViewProducts: () => void;
}

export default function CatalogueMaskedAlert({
  maskedCount,
  onViewProducts,
}: CatalogueMaskedAlertProps) {
  if (maskedCount <= 0) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2, borderRadius: 4, alignItems: 'center' }}
      action={
        <Button color="warning" variant="outlined" onClick={onViewProducts} sx={{ borderRadius: 999 }}>
          Voir les produits
        </Button>
      }
    >
      <Typography fontWeight={800}>
        {maskedCount} produits masques automatiquement aujourd&apos;hui (stock disponible = 0)
      </Typography>
      <Typography variant="body2">
        Ces produits ne sont plus visibles sur les canaux de vente tant que le stock reste a 0.
      </Typography>
    </Alert>
  );
}
