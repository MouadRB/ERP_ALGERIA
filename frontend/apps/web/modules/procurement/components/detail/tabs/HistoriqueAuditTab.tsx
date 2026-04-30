import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

type AuditEntry = {
  id: string;
  action: string;
  at: string;
  by: string;
};

type HistoriqueAuditTabProps = {
  audits: AuditEntry[];
};

const columns: GridColDef[] = [
  { field: "action", headerName: "Action", flex: 1.5, minWidth: 200 },
  { field: "by", headerName: "Par", flex: 1, minWidth: 140 },
  { field: "at", headerName: "Date", flex: 1, minWidth: 160 }
];

export default function HistoriqueAuditTab({ audits }: HistoriqueAuditTabProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1">Historique d'audit</Typography>
        <Divider sx={{ marginY: 2 }} />
        <Box>
          <DataGrid
            rows={audits}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            hideFooter
          />
        </Box>
      </CardContent>
    </Card>
  );
}
