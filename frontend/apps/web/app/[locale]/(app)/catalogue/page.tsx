"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Item", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "CAT-001", status: "active" }];

export default function CataloguePage() {
  return (
    <Box>
      <PageHeader title="Catalogue" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
