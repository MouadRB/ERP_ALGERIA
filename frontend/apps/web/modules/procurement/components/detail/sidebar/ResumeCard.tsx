import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { formatDZD } from "@ferza/shared";
import type { BonCommande } from "@ferza/shared";

type ResumeCardProps = {
  totalTTC: number;
  itemsCount: number;
  status: BonCommande["status"];
  createdAt: string;
  expectedDeliveryDate: string | null;
};

const statusLabel = (status: BonCommande["status"]) => {
  switch (status) {
    case "Draft":
      return "Brouillon";
    case "PendingApproval":
      return "En attente approbation";
    case "Approved":
      return "Approuvé";
    case "SentToSupplier":
      return "Envoyé fournisseur";
    case "PartiallyReceived":
      return "Partiellement reçu";
    case "FullyReceived":
      return "Réceptionné";
    case "Invoiced":
      return "Facturé";
    case "Rejected":
      return "Refusé";
    case "Cancelled":
      return "Annulé";
    default:
      return status;
  }
};

export default function ResumeCard({
  totalTTC,
  itemsCount,
  status,
  createdAt,
  expectedDeliveryDate
}: ResumeCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">Résumé</Typography>
        <Typography variant="h6" sx={{ marginTop: 1 }}>
          {formatDZD(totalTTC)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {itemsCount} article(s)
        </Typography>
        <Divider sx={{ marginY: 2 }} />
        <Stack spacing={0.5}>
          <Typography variant="body2">Statut: {statusLabel(status)}</Typography>
          <Typography variant="body2">Créé le: {createdAt.split("T")[0]}</Typography>
          <Typography variant="body2">
            Livraison prévue: {expectedDeliveryDate ? expectedDeliveryDate.split("T")[0] : "-"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
