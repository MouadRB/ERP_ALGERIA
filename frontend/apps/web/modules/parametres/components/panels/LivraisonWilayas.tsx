"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PowerSettingsNewRounded from "@mui/icons-material/PowerSettingsNewRounded";
import PowerOffOutlined from "@mui/icons-material/PowerOffOutlined";
import SettingsActionDialog from "../SettingsActionDialog";
import type { LivraisonWilayasForm } from "../../types";

type LivraisonWilayasProps = {
  formData: LivraisonWilayasForm;
  onFormChange: (field: keyof LivraisonWilayasForm, value: unknown) => void;
  onSave: () => void;
  isSaving: boolean;
  onNotify?: (message: string) => void;
};

const wilayaNames: Record<number, string> = {
  1: "Adrar",
  2: "Chlef",
  3: "Laghouat",
  4: "Oum El Bouaghi",
  5: "Batna",
  6: "Béjaïa",
  7: "Biskra",
  8: "Béchar",
  9: "Blida",
  10: "Bouira",
  11: "Tamanrasset",
  12: "Tébessa",
  13: "Tlemcen",
  14: "Tiaret",
  15: "Tizi Ouzou",
  16: "Alger",
  17: "Djelfa",
  18: "Jijel",
  19: "Sétif",
  20: "Saïda",
  21: "Skikda",
  22: "Sidi Bel Abbès",
  23: "Annaba",
  24: "Guelma",
  25: "Constantine",
  26: "Médéa",
  27: "Mostaganem",
  28: "M'Sila",
  29: "Mascara",
  30: "Ouargla",
  31: "Oran",
  32: "El Bayadh",
  33: "Illizi",
  34: "B.B.Arréridj",
  35: "Boumerdès",
  36: "El Tarf",
  37: "Tindouf",
  38: "Tissemsilt",
  39: "El Oued",
  40: "Khenchela",
  41: "Souk Ahras",
  42: "Tipaza",
  43: "Mila",
  44: "Aïn Defla",
  45: "Naâma",
  46: "Aïn Témouchent",
  47: "Ghardaïa",
  48: "Relizane",
  49: "El M'Ghair",
  50: "El Meniaa",
  51: "Ouled Djellal",
  52: "B.B.Mokhtar",
  53: "Béni Abbès",
  54: "Timimoun",
  55: "Touggourt",
  56: "Djanet",
  57: "In Salah",
  58: "In Guezzam"
};

export default function LivraisonWilayas({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onNotify
}: LivraisonWilayasProps) {
  const [carrierDialog, setCarrierDialog] = useState<{
    open: boolean;
    index: number | null;
    values: { nom: string; statut: string; delai: string; tarif: string };
  }>({
    open: false,
    index: null,
    values: { nom: "", statut: "test", delai: "", tarif: "" }
  });

  const cycleWilayaStatus = (num: number) => {
    const currentStatus = formData.wilayas[num] || "couvert";
    const nextStatus =
      currentStatus === "couvert"
        ? "majore"
        : currentStatus === "majore"
        ? "non-desservi"
        : "couvert";
    onFormChange("wilayas", {
      ...formData.wilayas,
      [num]: nextStatus
    });
  };

  const toggleTransporteur = (index: number) => {
    const updated = [...formData.transporteurs];
    updated[index] = {
      ...updated[index],
      statut: updated[index].statut === "inactif" ? "actif" : "inactif"
    };
    onFormChange("transporteurs", updated);
  };

  const addTransporteur = () => {
    setCarrierDialog({
      open: true,
      index: null,
      values: { nom: "", statut: "test", delai: "", tarif: "" }
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Livraison & Wilayas
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Gérez vos transporteurs et zones de livraison
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Transporteurs Actifs
          </Typography>
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Transporteur</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Délai moyen</TableCell>
                <TableCell>Tarif base</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.transporteurs.map((transporteur, index) => (
                <TableRow key={`${transporteur.nom}-${index}`}>
                  <TableCell>{transporteur.nom}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        transporteur.statut === "actif"
                          ? "🟢 Actif"
                          : transporteur.statut === "test"
                          ? "🟡 Test"
                          : "🔴 Inactif"
                      }
                      variant="outlined"
                      sx={{
                        borderColor:
                          transporteur.statut === "actif"
                            ? "#BBF7D0"
                            : transporteur.statut === "test"
                            ? "#FED7AA"
                            : "#FECACA",
                        bgcolor:
                          transporteur.statut === "actif"
                            ? "#F0FDF4"
                            : transporteur.statut === "test"
                            ? "#FFF7ED"
                            : "#FEF2F2",
                        color:
                          transporteur.statut === "actif"
                            ? "#15803D"
                            : transporteur.statut === "test"
                            ? "#B45309"
                            : "#B91C1C"
                      }}
                    />
                  </TableCell>
                  <TableCell>{transporteur.delai || "—"}</TableCell>
                  <TableCell>{transporteur.tarif || "—"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCarrierDialog({
                            open: true,
                            index,
                            values: { ...transporteur }
                          })
                        }
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => toggleTransporteur(index)}>
                        {transporteur.statut === "inactif" ? (
                          <PowerSettingsNewRounded fontSize="small" sx={{ color: "#16A34A" }} />
                        ) : (
                          <PowerOffOutlined fontSize="small" sx={{ color: "#DC2626" }} />
                        )}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddRounded />}
            sx={{ mt: 2 }}
            onClick={addTransporteur}
          >
            Ajouter un transporteur
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Zones de Livraison par Wilaya
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Cliquez sur une wilaya pour changer son statut
          </Typography>

          <Box
            mt={2}
            display="grid"
            gridTemplateColumns={{ xs: "repeat(6, 1fr)", sm: "repeat(8, 1fr)", md: "repeat(10, 1fr)" }}
            gap={1}
          >
            {Array.from({ length: 58 }, (_, i) => i + 1).map((num) => {
              const status = formData.wilayas[num] || "couvert";
              const styles =
                status === "couvert"
                  ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                  : status === "majore"
                  ? { backgroundColor: "#FFEDD5", color: "#B45309" }
                  : { backgroundColor: "#E2E8F0", color: "#64748B" };
              return (
                <Tooltip key={num} title={wilayaNames[num]}>
                  <Paper
                    component="button"
                    onClick={() => cycleWilayaStatus(num)}
                    sx={{
                      border: "none",
                      borderRadius: 2,
                      height: 40,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      ...styles,
                      "&:hover": { filter: "brightness(0.95)" }
                    }}
                  >
                    {String(num).padStart(2, "0")}
                  </Paper>
                </Tooltip>
              );
            })}
          </Box>

          <Stack direction="row" spacing={3} mt={3} flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, bgcolor: "#DCFCE7", borderRadius: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Couvert (standard)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, bgcolor: "#FFEDD5", borderRadius: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Majoré (+100–200 DZD)
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 16, height: 16, bgcolor: "#E2E8F0", borderRadius: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Non desservi
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Politique de retour COD
          </Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Délai de retour
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  value={formData.delaiRetour}
                  onChange={(event) => onFormChange("delaiRetour", event.target.value)}
                  sx={{ width: 120 }}
                />
                <Typography variant="body2" color="text.secondary">
                  jours
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Frais retour à charge
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={formData.fraisRetourCharge}
                  onChange={(event) => onFormChange("fraisRetourCharge", event.target.value)}
                >
                  <FormControlLabel value="client" control={<Radio />} label="Client" />
                  <FormControlLabel value="vendeur" control={<Radio />} label="Vendeur" />
                  <FormControlLabel value="partage" control={<Radio />} label="Partagé" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: "#E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Typography variant="body2">
                  Rembourser automatiquement à réception retour
                </Typography>
                <Switch
                  checked={formData.remboursementAuto}
                  onChange={(event) => onFormChange("remboursementAuto", event.target.checked)}
                />
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isSaving}
          sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </Box>

      <SettingsActionDialog
        open={carrierDialog.open}
        title={carrierDialog.index === null ? "Ajouter un transporteur" : "Modifier le transporteur"}
        description="Mettez à jour les informations opérationnelles du transporteur."
        fields={[
          { key: "nom", label: "Nom" },
          {
            key: "statut",
            label: "Statut",
            type: "select",
            options: [
              { label: "Actif", value: "actif" },
              { label: "Test", value: "test" },
              { label: "Inactif", value: "inactif" }
            ]
          },
          { key: "delai", label: "Délai moyen" },
          { key: "tarif", label: "Tarif de base" }
        ]}
        values={carrierDialog.values}
        onClose={() => setCarrierDialog((prev) => ({ ...prev, open: false }))}
        onChange={(key, value) =>
          setCarrierDialog((prev) => ({
            ...prev,
            values: {
              ...prev.values,
              [key]: value as string
            }
          }))
        }
        onSubmit={() => {
          const updated = [...formData.transporteurs];
          if (carrierDialog.index === null) {
            updated.push(carrierDialog.values);
            onNotify?.("Transporteur ajouté");
          } else {
            updated[carrierDialog.index] = carrierDialog.values;
            onNotify?.("Transporteur mis à jour");
          }
          onFormChange("transporteurs", updated);
          setCarrierDialog((prev) => ({ ...prev, open: false }));
        }}
      />
    </Box>
  );
}
