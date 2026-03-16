"use client";

import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import FilterListRounded from "@mui/icons-material/FilterListRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";

const rows = [
  {
    id: "#10042",
    client: "+213 0550 123 456",
    note: "Nouvelle cliente",
    wilaya: "Alger (16)",
    montant: "4 500 DZD",
    risque: { label: "Faible", color: "#16A34A", bg: "#DCFCE7" },
    statut: { label: "En Attente", color: "#F59E0B", bg: "#FEF3C7" },
    minuterie: { label: "1h 47min", color: "#16A34A", bg: "#DCFCE7" }
  },
  {
    id: "#10043",
    client: "+213 0661 987 654",
    note: "2 commandes",
    wilaya: "Oran (31)",
    montant: "12 200 DZD",
    risque: { label: "Moyen", color: "#F59E0B", bg: "#FEF3C7" },
    statut: { label: "En Attente", color: "#F59E0B", bg: "#FEF3C7" },
    minuterie: { label: "23min", color: "#EF4444", bg: "#FEE2E2" }
  },
  {
    id: "#10044",
    client: "+213 0770 456 789",
    note: "Connu, 1 absence",
    wilaya: "Setif (19)",
    montant: "8 400 DZD",
    risque: { label: "Eleve", color: "#EF4444", bg: "#FEE2E2" },
    statut: { label: "En Attente", color: "#F59E0B", bg: "#FEF3C7" },
    minuterie: { label: "12min", color: "#EF4444", bg: "#FEE2E2" }
  },
  {
    id: "#10045",
    client: "+213 0550 321 000",
    note: "Champion RFM",
    wilaya: "Constantine (25)",
    montant: "6 800 DZD",
    risque: { label: "Faible", color: "#16A34A", bg: "#DCFCE7" },
    statut: { label: "Confirme", color: "#3B82F6", bg: "#DBEAFE" },
    minuterie: { label: "--", color: "#94A3B8", bg: "#E2E8F0" }
  },
  {
    id: "#10046",
    client: "+213 0661 654 321",
    note: "Nouvelle cliente",
    wilaya: "Annaba (23)",
    montant: "3 200 DZD",
    risque: { label: "Faible", color: "#16A34A", bg: "#DCFCE7" },
    statut: { label: "En Attente", color: "#F59E0B", bg: "#FEF3C7" },
    minuterie: { label: "52min", color: "#16A34A", bg: "#DCFCE7" }
  }
];

export default function ConfirmationTableCard() {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: "1px solid #E6EDF5",
        backgroundColor: "#FFFFFF"
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" p={2.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            File de Confirmation
          </Typography>
          <Chip
            label="23 en attente"
            size="small"
            sx={{ bgcolor: "#FFE8C2", color: "#B45309", fontWeight: 600 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="text"
            startIcon={<FilterListRounded />}
            sx={{ color: "#64748B", textTransform: "none" }}
          >
            Filtrer
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#1A4E8A",
              textTransform: "none",
              "&:hover": { bgcolor: "#143B68" }
            }}
          >
            Tout confirmer
          </Button>
        </Stack>
      </Stack>
      <Divider />
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell># COMMANDE</TableCell>
              <TableCell>CLIENT</TableCell>
              <TableCell>WILAYA</TableCell>
              <TableCell>MONTANT</TableCell>
              <TableCell>RISQUE</TableCell>
              <TableCell>STATUT</TableCell>
              <TableCell>MINUTERIE</TableCell>
              <TableCell>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography fontWeight={700} color="#1A4E8A">
                    {row.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{row.client}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.note}
                  </Typography>
                </TableCell>
                <TableCell>{row.wilaya}</TableCell>
                <TableCell>
                  <Typography fontWeight={700}>{row.montant}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.risque.label}
                    size="small"
                    sx={{
                      bgcolor: row.risque.bg,
                      color: row.risque.color,
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.statut.label}
                    size="small"
                    sx={{
                      bgcolor: row.statut.bg,
                      color: row.statut.color,
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<AccessTimeRounded sx={{ fontSize: 14 }} />}
                    label={row.minuterie.label}
                    size="small"
                    sx={{
                      bgcolor: row.minuterie.bg,
                      color: row.minuterie.color,
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        bgcolor: "#16A34A",
                        textTransform: "none",
                        "&:hover": { bgcolor: "#15803D" }
                      }}
                    >
                      Confirmer
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "#EF4444",
                        borderColor: "#FCA5A5",
                        textTransform: "none",
                        "&:hover": { borderColor: "#EF4444", bgcolor: "#FEE2E2" }
                      }}
                    >
                      Annuler
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          Affichage 6 sur 23 commandes en attente
        </Typography>
        <Button variant="text" sx={{ textTransform: "none" }}>
          Voir toutes les commandes
        </Button>
      </Box>
    </Paper>
  );
}
