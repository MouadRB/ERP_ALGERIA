import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";

type AuditEntry = {
  id: string;
  action: string;
  at: string;
  by: string;
};

type AuditLogCardProps = {
  audits: AuditEntry[];
};

export default function AuditLogCard({ audits }: AuditLogCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">Journal d'audit</Typography>
        <Divider sx={{ marginY: 2 }} />
        <Stack spacing={1}>
          {audits.slice(0, 3).map((audit) => (
            <Typography key={audit.id} variant="body2">
              {audit.action} · {audit.at}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
