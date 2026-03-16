"use client";

import PageHeader from "@/components/ui/PageHeader";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const columns: GridColDef[] = [
  { field: "id", headerName: "Customer", flex: 1 },
  { field: "status", headerName: "Segment", flex: 1 }
];

const rows = [{ id: "CUST-001", status: "vip" }];

export default function CRMPage() {
  return (
    <Box>
      <PageHeader title="CRM" />
      <DataGrid rows={rows} columns={columns} autoHeight disableRowSelectionOnClick />
    </Box>
  );
}
