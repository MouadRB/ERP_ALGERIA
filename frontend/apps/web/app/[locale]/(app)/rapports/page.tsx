"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Report", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "RPT-001", status: "ready" }];

export default function RapportsPage() {
  return (
    <Box>
      <PageHeader title="Rapports" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
