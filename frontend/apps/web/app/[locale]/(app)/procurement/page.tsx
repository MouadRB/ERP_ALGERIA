"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "BC", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "BC-001", status: "draft" }];

export default function ProcurementPage() {
  return (
    <Box>
      <PageHeader title="Procurement" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
