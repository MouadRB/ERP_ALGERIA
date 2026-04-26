import { Card, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";

type FournisseurTabProps = {
  supplierName: string;
  supplierId: string;
  wilayaCode: string;
  createdBy: string;
  approvedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
};

export default function FournisseurTab({
  supplierName,
  supplierId,
  wilayaCode,
  createdBy,
  approvedBy,
  rejectedBy,
  rejectionReason
}: FournisseurTabProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">Fournisseur</Typography>
        <Divider sx={{ marginY: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Nom
              </Typography>
              <Typography variant="body1">{supplierName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Identifiant fournisseur
              </Typography>
              <Typography variant="body1">{supplierId}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Wilaya
              </Typography>
              <Typography variant="body1">{wilayaCode}</Typography>
              <Typography variant="body2" color="text.secondary">
                Créé par
              </Typography>
              <Typography variant="body1">{createdBy}</Typography>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ marginY: 2 }} />
        <Stack spacing={1}>
          <Typography variant="body2">Approuvé par: {approvedBy ?? "-"}</Typography>
          <Typography variant="body2">Rejeté par: {rejectedBy ?? "-"}</Typography>
          <Typography variant="body2" color="text.secondary">
            Motif: {rejectionReason ?? "Non renseigné"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
