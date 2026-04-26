import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";

type ImpactInventaireCardProps = {
  wilayaCode: string;
  autoCancelAt: string | null;
};

export default function ImpactInventaireCard({
  wilayaCode,
  autoCancelAt
}: ImpactInventaireCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">Impact inventaire</Typography>
        <Divider sx={{ marginY: 2 }} />
        <Stack spacing={0.5}>
          <Typography variant="body2">Wilaya: {wilayaCode}</Typography>
          <Typography variant="body2">
            Annulation auto: {autoCancelAt ? autoCancelAt.split("T")[0] : "-"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
