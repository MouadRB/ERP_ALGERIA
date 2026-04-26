import { Card, CardContent, Stack, Typography } from "@mui/material";
import StatusChip from "@/components/ui/StatusChip";

type ProcurementAlert = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
};

type AlertsTabProps = {
  alerts: ProcurementAlert[];
};

const severityColor = (severity: ProcurementAlert["severity"]) => {
  switch (severity) {
    case "error":
      return "error";
    case "warning":
      return "warning";
    default:
      return "primary";
  }
};

export default function AlertsTab({ alerts }: AlertsTabProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom fontWeight={700}>
          Alertes actives
        </Typography>
        <Stack spacing={1}>
          {alerts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucune alerte active.
            </Typography>
          ) : (
            alerts.map((alert) => (
              <Stack
                key={alert.id}
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="body2" color="text.secondary">
                  {alert.message}
                </Typography>
                <StatusChip label={alert.severity.toUpperCase()} color={severityColor(alert.severity)} />
              </Stack>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
