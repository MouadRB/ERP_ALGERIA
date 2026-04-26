"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import SettingsActionDialog from "../SettingsActionDialog";
import type { InventaireStockForm } from "../../types";

type InventaireStockProps = {
  formData: InventaireStockForm;
  onFormChange: (field: keyof InventaireStockForm, value: unknown) => void;
  onSave: () => void;
  isSaving: boolean;
  onNotify?: (message: string) => void;
};

export default function InventaireStock({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onNotify
}: InventaireStockProps) {
  const [warehouseDialog, setWarehouseDialog] = useState({
    open: false,
    values: {
      nom: "",
      wilaya: "Alger (16)",
      responsable: "",
      statut: "actif"
    }
  });

  const total =
    formData.seuilCritique + formData.seuilAvertissement + formData.seuilFaible || 1;

  const addEntrepot = () => {
    setWarehouseDialog({
      open: true,
      values: {
        nom: "",
        wilaya: "Alger (16)",
        responsable: "",
        statut: "actif"
      }
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Inventaire & Stock
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Configurez les alertes et la gestion du stock
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              Seuils d'Alerte
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.alertesActives}
                  onChange={(event) => onFormChange("alertesActives", event.target.checked)}
                />
              }
              label="Activer les alertes de rupture de stock"
            />
          </Box>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="#DC2626" mb={1}>
                Seuil critique (rouge)
              </Typography>
              <TextField
                type="number"
                value={formData.seuilCritique}
                onChange={(event) =>
                  onFormChange("seuilCritique", parseInt(event.target.value, 10) || 0)
                }
                sx={{ width: 140 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="#EA580C" mb={1}>
                Seuil d'avertissement (orange)
              </Typography>
              <TextField
                type="number"
                value={formData.seuilAvertissement}
                onChange={(event) =>
                  onFormChange("seuilAvertissement", parseInt(event.target.value, 10) || 0)
                }
                sx={{ width: 140 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="#EAB308" mb={1}>
                Seuil faible (jaune)
              </Typography>
              <TextField
                type="number"
                value={formData.seuilFaible}
                onChange={(event) =>
                  onFormChange("seuilFaible", parseInt(event.target.value, 10) || 0)
                }
                sx={{ width: 140 }}
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Aperçu des zones
            </Typography>
            <Box display="flex" height={10} borderRadius={6} overflow="hidden">
              <Box sx={{ width: `${(formData.seuilCritique / total) * 100}%`, bgcolor: "#EF4444" }} />
              <Box sx={{ width: `${(formData.seuilAvertissement / total) * 100}%`, bgcolor: "#F97316" }} />
              <Box sx={{ width: `${(formData.seuilFaible / total) * 100}%`, bgcolor: "#FACC15" }} />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.seuilCritique}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.seuilCritique + formData.seuilAvertissement}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {total}+
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Gestion des Entrepôts
          </Typography>
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Entrepôt</TableCell>
                <TableCell>Wilaya</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.entrepots.map((entrepot, index) => (
                <TableRow key={`${entrepot.nom}-${index}`}>
                  <TableCell>{entrepot.nom}</TableCell>
                  <TableCell>{entrepot.wilaya}</TableCell>
                  <TableCell>{entrepot.responsable}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label="🟢 Actif"
                      variant="outlined"
                      sx={{ borderColor: "#BBF7D0", bgcolor: "#F0FDF4", color: "#15803D" }}
                    />
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
            onClick={addEntrepot}
          >
            Ajouter un entrepôt
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              Réapprovisionnement automatique
            </Typography>
            <Switch
              checked={formData.reapproAuto}
              onChange={(event) => onFormChange("reapproAuto", event.target.checked)}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Créer automatiquement un bon de commande quand le seuil critique est atteint
          </Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fournisseur par défaut"
                select
                fullWidth
                value={formData.fournisseurDefaut}
                onChange={(event) => onFormChange("fournisseurDefaut", event.target.value)}
              >
                <MenuItem value="supplier-express">Supplier Express DZ</MenuItem>
                <MenuItem value="import-dz">Import DZ Pro</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Délai de préavis"
                fullWidth
                value={formData.delaiPreavis}
                onChange={(event) => onFormChange("delaiPreavis", event.target.value)}
              />
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
        open={warehouseDialog.open}
        title="Ajouter un entrepôt"
        description="Renseignez l'entrepôt qui doit être pris en compte dans la répartition des stocks."
        fields={[
          { key: "nom", label: "Nom de l'entrepôt" },
          { key: "wilaya", label: "Wilaya" },
          { key: "responsable", label: "Responsable" },
          {
            key: "statut",
            label: "Statut",
            type: "select",
            options: [
              { label: "Actif", value: "actif" },
              { label: "Inactif", value: "inactif" }
            ]
          }
        ]}
        values={warehouseDialog.values}
        onClose={() => setWarehouseDialog((prev) => ({ ...prev, open: false }))}
        onChange={(key, value) =>
          setWarehouseDialog((prev) => ({
            ...prev,
            values: {
              ...prev.values,
              [key]: value as string
            }
          }))
        }
        onSubmit={() => {
          onFormChange("entrepots", [...formData.entrepots, warehouseDialog.values]);
          onNotify?.("Entrepôt ajouté");
          setWarehouseDialog((prev) => ({ ...prev, open: false }));
        }}
      />
    </Box>
  );
}
