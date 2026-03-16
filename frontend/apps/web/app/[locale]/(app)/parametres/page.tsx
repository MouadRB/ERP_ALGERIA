"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Setting", flex: 1 },
  { field: "status", headerName: "Value", flex: 1 }
];

const rows = [{ id: "Locale", status: "fr" }];

export default function ParametresPage() {
  return (
    <Box>
      <PageHeader title="Parametres" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
