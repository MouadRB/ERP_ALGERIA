"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "SKU", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "SKU-001", status: "in-stock" }];

export default function InventoryPage() {
  return (
    <Box>
      <PageHeader title="Inventory" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
