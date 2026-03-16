"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Section", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "DETAIL", status: "mock" }];

export default function CatalogueDetailPage() {
  return (
    <Box>
      <PageHeader title="Catalogue Detail" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
