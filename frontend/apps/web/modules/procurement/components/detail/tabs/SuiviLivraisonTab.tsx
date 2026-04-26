import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import StatusChip from "@/components/ui/StatusChip";
import type { BonCommande } from "@ferza/shared";

type SuiviLivraisonTabProps = {
  status: BonCommande["status"];
  expectedDeliveryDate: string | null;
  autoCancelAt: string | null;
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

const statusColor = (status: BonCommande["status"]) => {
  switch (status) {
    case "Approved":
    case "FullyReceived":
    case "Invoiced":
      return "success";
    case "Rejected":
    case "Cancelled":
      return "error";
    case "PendingApproval":
    case "SentToSupplier":
    case "PartiallyReceived":
      return "warning";
    default:
      return "default";
  }
};

export default function SuiviLivraisonTab({
  status,
  expectedDeliveryDate,
  autoCancelAt
}: SuiviLivraisonTabProps) {
  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1">Suivi de livraison</Typography>
          <Divider sx={{ marginY: 2 }} />
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip label={statusLabel(status)} color={statusColor(status)} />
              <Typography variant="body2" color="text.secondary">
                Prévue: {expectedDeliveryDate ? expectedDeliveryDate.split("T")[0] : "-"}
              </Typography>
            </Stack>
            <Typography variant="body2">
              Annulation auto: {autoCancelAt ? autoCancelAt.split("T")[0] : "-"}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1">Notes de réception</Typography>
          <Divider sx={{ marginY: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Coordonner la réception avec le dépôt pour le contrôle qualité et le pointage des écarts.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
