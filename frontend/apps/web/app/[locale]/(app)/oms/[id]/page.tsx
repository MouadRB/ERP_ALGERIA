"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Step", flex: 1 },
  { field: "status", headerName: "Status", flex: 1 }
];

const rows = [{ id: "DETAIL", status: "mock" }];

export default function OMSDetailPage() {
  return (
    <Box>
      <PageHeader title="OMS Detail" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
