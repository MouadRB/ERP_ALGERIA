"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Order", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "ORD-001", status: "pending" }];

export default function OMSPage() {
  return (
    <Box>
      <PageHeader title="OMS" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
