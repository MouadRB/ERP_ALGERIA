"use client";

import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

type DataTableProps = {
  rows: Array<{ id: string | number }>;
  columns: GridColDef[];
  height?: number;
};

export default function DataTable({ rows, columns, height = 360 }: DataTableProps) {
  return (
    <Box height={height}>
      <DataGrid rows={rows} columns={columns} disableRowSelectionOnClick />
    </Box>
  );
}
