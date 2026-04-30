"use client";

import { Chip, InputAdornment, MenuItem, Stack, TextField } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import { BC_STATES, type BonCommande } from "@ferza/shared";

type ProcurementFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: BonCommande["status"] | "all";
  onStatusChange: (value: BonCommande["status"] | "all") => void;
  supplierFilter: string;
  onSupplierChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  rangeFilter: string;
  onRangeChange: (value: string) => void;
  sortFilter: string;
  onSortChange: (value: string) => void;
  supplierOptions: string[];
  draftCount: number;
  pendingApprovals: number;
  transitCount: number;
};

export default function ProcurementFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  supplierFilter,
  onSupplierChange,
  priorityFilter,
  onPriorityChange,
  rangeFilter,
  onRangeChange,
  sortFilter,
  onSortChange,
  supplierOptions,
  draftCount,
  pendingApprovals,
  transitCount
}: ProcurementFiltersProps) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", lg: "center" }}
    >
      <TextField
        size="small"
        placeholder="Rechercher #BC, fournisseur, SKU, produit..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        sx={{ minWidth: { lg: 260 }, flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>
          )
        }}
      />
      <TextField
        select
        size="small"
        label="Tous les statuts"
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value as BonCommande["status"] | "all")}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="all">Tous</MenuItem>
        {BC_STATES.map((state) => (
          <MenuItem key={state} value={state}>
            {state}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Tous"
        value={supplierFilter}
        onChange={(event) => onSupplierChange(event.target.value)}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="all">Tous</MenuItem>
        {supplierOptions.map((supplier) => (
          <MenuItem key={supplier} value={supplier}>
            {supplier}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Toutes"
        value={priorityFilter}
        onChange={(event) => onPriorityChange(event.target.value)}
        sx={{ minWidth: 130 }}
      >
        <MenuItem value="all">Toutes</MenuItem>
        <MenuItem value="urgent">Urgente</MenuItem>
        <MenuItem value="high">Haute</MenuItem>
        <MenuItem value="normal">Normale</MenuItem>
        <MenuItem value="low">Basse</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Ce mois"
        value={rangeFilter}
        onChange={(event) => onRangeChange(event.target.value)}
        sx={{ minWidth: 130 }}
      >
        <MenuItem value="month">Ce mois</MenuItem>
        <MenuItem value="quarter">Ce trimestre</MenuItem>
        <MenuItem value="semester">Ce semestre</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Tri"
        value={sortFilter}
        onChange={(event) => onSortChange(event.target.value)}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="createdDesc">Date création desc</MenuItem>
        <MenuItem value="createdAsc">Date création asc</MenuItem>
        <MenuItem value="amountDesc">Montant desc</MenuItem>
        <MenuItem value="amountAsc">Montant asc</MenuItem>
      </TextField>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ marginLeft: { lg: "auto" }, flexWrap: "wrap" }}
      >
        <Chip label={`Brouillon ${draftCount}`} size="small" variant="outlined" />
        <Chip
          label={`Approbation ${pendingApprovals}`}
          size="small"
          sx={{ backgroundColor: "#FEF3C7", color: "#D97706" }}
        />
        <Chip
          label={`Transit ${transitCount}`}
          size="small"
          sx={{ backgroundColor: "#E0E7FF", color: "#4338CA" }}
        />
      </Stack>
    </Stack>
  );
}
