"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Section", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "INFO", status: "mock" }];

export default function PIMDetailPage() {
  return (
    <Box>
      <PageHeader title="PIM Detail" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
