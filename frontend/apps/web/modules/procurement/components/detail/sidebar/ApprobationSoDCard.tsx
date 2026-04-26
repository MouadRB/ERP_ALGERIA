import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import StatusChip from "@/components/ui/StatusChip";

type ApprovalStep = {
  step: string;
  status: "pending" | "approved" | "rejected";
  owner: string;
};

type ApprobationSoDCardProps = {
  approvals: ApprovalStep[];
};

const approvalStatusLabel = (status: ApprovalStep["status"]) => {
  switch (status) {
    case "approved":
      return "Approuvé";
    case "rejected":
      return "Rejeté";
    default:
      return "En attente";
  }
};

const statusColor = (status: ApprovalStep["status"]) => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "warning";
  }
};

export default function ApprobationSoDCard({ approvals }: ApprobationSoDCardProps) {
  const pending = approvals.filter((item) => item.status === "pending").length;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">Approbation SoD</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
          {pending} validation(s) en attente
        </Typography>
        <Divider sx={{ marginY: 2 }} />
        <Stack spacing={1}>
          {approvals.map((approval) => (
            <Stack
              key={approval.step}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
            >
              <Typography variant="body2">
                {approval.step}: {approval.owner}
              </Typography>
              <StatusChip
                label={approvalStatusLabel(approval.status)}
                color={statusColor(approval.status)}
              />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
