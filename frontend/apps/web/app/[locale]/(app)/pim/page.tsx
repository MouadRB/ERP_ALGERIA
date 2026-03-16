"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Product", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "PRD-001", status: "active" }];

export default function PIMPage() {
  return (
    <Box>
      <PageHeader title="PIM" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
