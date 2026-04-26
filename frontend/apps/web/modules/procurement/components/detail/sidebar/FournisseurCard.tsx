import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";

type FournisseurCardProps = {
  supplierName: string;
  supplierId: string;
  wilayaCode: string;
};

export default function FournisseurCard({
  supplierName,
  supplierId,
  wilayaCode
}: FournisseurCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">Fournisseur</Typography>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          {supplierName}
        </Typography>
        <Divider sx={{ marginY: 2 }} />
        <Stack spacing={0.5}>
          <Typography variant="body2">Identifiant fournisseur: {supplierId}</Typography>
          <Typography variant="body2">Wilaya: {wilayaCode}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
