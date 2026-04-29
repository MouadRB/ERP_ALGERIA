import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatDZD } from "@ferza/shared";
import type { BCItem } from "@ferza/shared";

type ArticlesMontantsTabProps = {
  items: BCItem[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
};

const columns: GridColDef[] = [
  { field: "sku", headerName: "SKU", flex: 1, minWidth: 120 },
  { field: "nameFr", headerName: "Article", flex: 1.4, minWidth: 180 },
  { field: "quantityOrdered", headerName: "Qté", type: "number", width: 90 },
  {
    field: "unitPriceHT",
    headerName: "Prix unitaire",
    flex: 1,
    minWidth: 130,
    valueFormatter: (value) => formatDZD(Number(value))
  },
  {
    field: "lineTotal",
    headerName: "Total ligne",
    flex: 1,
    minWidth: 140,
    valueFormatter: (value) => formatDZD(Number(value))
  }
];

export default function ArticlesMontantsTab({
  items,
  totalHT,
  totalTVA,
  totalTTC
}: ArticlesMontantsTabProps) {
  const rows = items.map((item) => ({
    id: item.sku,
    ...item,
    lineTotal: item.quantityOrdered * item.unitPriceHT
  }));

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1">Articles</Typography>
          <Divider sx={{ marginY: 2 }} />
          <Box>
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              disableRowSelectionOnClick
              hideFooter
            />
          </Box>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1">Montants</Typography>
          <Divider sx={{ marginY: 2 }} />
          <Stack spacing={1}>
            <Typography variant="body2">Total HT: {formatDZD(totalHT)}</Typography>
            <Typography variant="body2">TVA: {formatDZD(totalTVA)}</Typography>
            <Typography variant="h6">Total TTC: {formatDZD(totalTTC)}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
