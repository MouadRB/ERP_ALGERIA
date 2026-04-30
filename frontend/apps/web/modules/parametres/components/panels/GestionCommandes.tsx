"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import SettingsActionDialog from "../SettingsActionDialog";
import type { GestionCommandesForm } from "../../types";

type GestionCommandesProps = {
  formData: GestionCommandesForm;
  onFormChange: (field: keyof GestionCommandesForm, value: unknown) => void;
  onSave: () => void;
  isSaving: boolean;
  onNotify?: (message: string) => void;
};

const statuts = [
  { id: "nouvelle", label: "Nouvelle", bg: "#F1F5F9", color: "#475569" },
  { id: "en-attente", label: "En Attente", bg: "#FEF3C7", color: "#B45309" },
  { id: "confirmee", label: "Confirmée", bg: "#DBEAFE", color: "#2563EB" },
  { id: "expediee", label: "Expédiée", bg: "#EDE9FE", color: "#7C3AED" },
  { id: "livree", label: "Livrée", bg: "#DCFCE7", color: "#15803D" },
  { id: "retournee", label: "Retournée", bg: "#FEE2E2", color: "#B91C1C" }
];

export default function GestionCommandes({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onNotify
}: GestionCommandesProps) {
  const [riskDialog, setRiskDialog] = useState({
    open: false,
    values: {
      niveau: "",
      absences: "",
      couleur: "vert",
      action: "Confirmer"
    }
  });

  const handleAddRiskLevel = () => {
    setRiskDialog({
      open: true,
      values: {
        niveau: "Nouveau",
        absences: "",
        couleur: "vert",
        action: "Confirmer"
      }
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Gestion des Commandes (OMS)
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Configurez les règles de gestion des commandes
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeRounded sx={{ color: "#2563EB" }} />
            <Typography variant="subtitle1" fontWeight={600}>
              Minuterie de Confirmation
            </Typography>
          </Stack>

          <Box mt={3} display="flex" flexDirection="column" gap={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Délai max de confirmation
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="number"
                  value={formData.delaiConfirmation}
                  onChange={(event) =>
                    onFormChange("delaiConfirmation", parseInt(event.target.value, 10) || 0)
                  }
                  sx={{ width: 120 }}
                />
                <Typography variant="body2" color="text.secondary">
                  minutes
                </Typography>
              </Stack>
              <Slider
                sx={{ mt: 2 }}
                value={formData.delaiConfirmation}
                onChange={(_, value) => onFormChange("delaiConfirmation", value as number)}
                min={30}
                max={240}
                step={10}
              />
            </Box>

            <Box
              sx={{
                bgcolor: "#EFF6FF",
                p: 2,
                borderRadius: 2,
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start"
              }}
            >
              <InfoOutlined sx={{ color: "#2563EB", mt: 0.2 }} />
              <Typography variant="body2" color="#1D4ED8">
                Au-delà de ce délai, la commande passe automatiquement en alerte rouge
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Action après expiration
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={formData.actionExpiration}
                  onChange={(event) => onFormChange("actionExpiration", event.target.value)}
                >
                  <FormControlLabel value="alerte" control={<Radio />} label="Alerte agent" />
                  <FormControlLabel
                    value="annulation"
                    control={<Radio />}
                    label="Annulation automatique"
                  />
                  <FormControlLabel
                    value="escalade"
                    control={<Radio />}
                    label="Escalade superviseur"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Règles de Risque Client
          </Typography>
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Niveau</TableCell>
                <TableCell>Absences</TableCell>
                <TableCell>Couleur</TableCell>
                <TableCell>Action auto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.niveauxRisque.map((niveau, index) => (
                <TableRow key={`${niveau.niveau}-${index}`}>
                  <TableCell>{niveau.niveau}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={niveau.absences}
                      onChange={(event) => {
                        const updated = [...formData.niveauxRisque];
                        updated[index] = { ...niveau, absences: event.target.value };
                        onFormChange("niveauxRisque", updated);
                      }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        niveau.couleur === "vert"
                          ? "🟢 Vert"
                          : niveau.couleur === "orange"
                          ? "🟡 Orange"
                          : "🔴 Rouge"
                      }
                      variant="outlined"
                      sx={{
                        borderColor:
                          niveau.couleur === "vert"
                            ? "#BBF7D0"
                            : niveau.couleur === "orange"
                            ? "#FED7AA"
                            : "#FECACA",
                        bgcolor:
                          niveau.couleur === "vert"
                            ? "#F0FDF4"
                            : niveau.couleur === "orange"
                            ? "#FFF7ED"
                            : "#FEF2F2",
                        color:
                          niveau.couleur === "vert"
                            ? "#15803D"
                            : niveau.couleur === "orange"
                            ? "#B45309"
                            : "#B91C1C"
                      }}
                    />
                  </TableCell>
                  <TableCell>{niveau.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddRounded />}
            sx={{ mt: 2 }}
            onClick={handleAddRiskLevel}
          >
            Ajouter un niveau
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Statuts des Commandes
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2} mt={2} alignItems="center">
            {statuts.map((statut, index) => (
              <Stack key={statut.id} direction="row" spacing={1} alignItems="center">
                <Chip
                  label={statut.label}
                  sx={{ bgcolor: statut.bg, color: statut.color, fontWeight: 600 }}
                />
                <Switch
                  checked={formData.statutsActifs[statut.id] !== false}
                  onChange={() =>
                    onFormChange("statutsActifs", {
                      ...formData.statutsActifs,
                      [statut.id]: !formData.statutsActifs[statut.id]
                    })
                  }
                />
                {index < statuts.length - 1 ? <Divider orientation="vertical" flexItem /> : null}
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Numérotation des Commandes
          </Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Préfixe"
                fullWidth
                value={formData.prefixeCommande}
                onChange={(event) => onFormChange("prefixeCommande", event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Prochain numéro"
                fullWidth
                value={formData.prochainNumero}
                onChange={(event) => onFormChange("prochainNumero", event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Format
              </Typography>
              <RadioGroup
                value={formData.formatCommande}
                onChange={(event) => onFormChange("formatCommande", event.target.value)}
              >
                <FormControlLabel value="simple" control={<Radio />} label="#NNNNN" />
                <FormControlLabel value="date" control={<Radio />} label="CMD-YYYYMMDD-NNN" />
              </RadioGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Confirmation automatique
          </Typography>
          <Stack spacing={2} mt={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">
                Activer la confirmation automatique pour les clients Champion RFM
              </Typography>
              <Switch
                checked={formData.confirmationAuto}
                onChange={(event) => onFormChange("confirmationAuto", event.target.checked)}
              />
            </Stack>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Délai de grâce
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  type="number"
                  value={formData.delaiGrace}
                  onChange={(event) =>
                    onFormChange("delaiGrace", parseInt(event.target.value, 10) || 0)
                  }
                  sx={{ width: 120 }}
                />
                <Typography variant="body2" color="text.secondary">
                  minutes après réception
                </Typography>
              </Stack>
            </Box>
          </Stack>
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
        open={riskDialog.open}
        title="Ajouter un niveau de risque"
        description="Définissez le nouveau palier de risque et l'action automatique associée."
        fields={[
          { key: "niveau", label: "Niveau" },
          { key: "absences", label: "Absences" },
          {
            key: "couleur",
            label: "Couleur",
            type: "select",
            options: [
              { label: "Vert", value: "vert" },
              { label: "Orange", value: "orange" },
              { label: "Rouge", value: "rouge" }
            ]
          },
          {
            key: "action",
            label: "Action auto",
            type: "select",
            options: [
              { label: "Confirmer", value: "Confirmer" },
              { label: "Vérification", value: "Vérification" },
              { label: "Alerte", value: "Alerte" }
            ]
          }
        ]}
        values={riskDialog.values}
        onClose={() =>
          setRiskDialog((prev) => ({
            ...prev,
            open: false
          }))
        }
        onChange={(key, value) =>
          setRiskDialog((prev) => ({
            ...prev,
            values: {
              ...prev.values,
              [key]: value as string
            }
          }))
        }
        onSubmit={() => {
          onFormChange("niveauxRisque", [...formData.niveauxRisque, riskDialog.values]);
          onNotify?.("Niveau de risque ajouté");
          setRiskDialog((prev) => ({ ...prev, open: false }));
        }}
      />
    </Box>
  );
}
