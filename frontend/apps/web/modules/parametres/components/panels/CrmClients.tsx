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
import EditOutlined from "@mui/icons-material/EditOutlined";
import SettingsActionDialog from "../SettingsActionDialog";
import type { CrmClientsForm } from "../../types";

type CrmClientsProps = {
  formData: CrmClientsForm;
  onFormChange: (field: keyof CrmClientsForm, value: unknown) => void;
  onSave: () => void;
  isSaving: boolean;
  onNotify?: (message: string) => void;
};

export default function CrmClients({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onNotify
}: CrmClientsProps) {
  const [segmentDialog, setSegmentDialog] = useState<{
    open: boolean;
    index: number;
    values: {
      segment: string;
      emoji: string;
      criteres: string;
      couleur: string;
      action: string;
    };
  } | null>(null);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          CRM & Clients
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Gérez la segmentation client et les règles de vérification
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Segmentation RFM
          </Typography>
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Segment</TableCell>
                <TableCell>Critères</TableCell>
                <TableCell>Couleur</TableCell>
                <TableCell>Actions auto</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.segmentsRfm.map((segment, index) => (
                <TableRow key={`${segment.segment}-${index}`}>
                  <TableCell>
                    {segment.emoji} {segment.segment}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{segment.criteres}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={segment.couleur.charAt(0).toUpperCase() + segment.couleur.slice(1)}
                      variant="outlined"
                      sx={{
                        borderColor:
                          segment.couleur === "bleu"
                            ? "#BFDBFE"
                            : segment.couleur === "vert"
                            ? "#BBF7D0"
                            : segment.couleur === "orange"
                            ? "#FED7AA"
                            : "#FECACA",
                        bgcolor:
                          segment.couleur === "bleu"
                            ? "#EFF6FF"
                            : segment.couleur === "vert"
                            ? "#F0FDF4"
                            : segment.couleur === "orange"
                            ? "#FFF7ED"
                            : "#FEF2F2",
                        color:
                          segment.couleur === "bleu"
                            ? "#2563EB"
                            : segment.couleur === "vert"
                            ? "#15803D"
                            : segment.couleur === "orange"
                            ? "#B45309"
                            : "#B91C1C"
                      }}
                    />
                  </TableCell>
                  <TableCell>{segment.action}</TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<EditOutlined fontSize="small" />}
                      onClick={() =>
                        setSegmentDialog({
                          open: true,
                          index,
                          values: { ...segment }
                        })
                      }
                    >
                      Modifier les seuils
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              Blacklist automatique
            </Typography>
            <Switch
              checked={formData.blacklistAuto}
              onChange={(event) => onFormChange("blacklistAuto", event.target.checked)}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Activer le blacklist automatique des clients problématiques
          </Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre d'absences pour blacklist"
                type="number"
                value={formData.absencesPourBlacklist}
                onChange={(event) =>
                  onFormChange("absencesPourBlacklist", parseInt(event.target.value, 10) || 0)
                }
                sx={{ width: 200 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Période de calcul"
                select
                fullWidth
                value={formData.periodeCalcul}
                onChange={(event) => onFormChange("periodeCalcul", event.target.value)}
              >
                <MenuItem value="30">30 derniers jours</MenuItem>
                <MenuItem value="60">60 jours</MenuItem>
                <MenuItem value="toujours">Toujours</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reintegrationManuelle}
                    onChange={(event) =>
                      onFormChange("reintegrationManuelle", event.target.checked)
                    }
                  />
                }
                label="Permettre réintégration manuelle par superviseur"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              OTP & Vérification
            </Typography>
            <Switch
              checked={formData.otpActif}
              onChange={(event) => onFormChange("otpActif", event.target.checked)}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Activer la vérification OTP pour les nouveaux clients
          </Typography>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Délai d'expiration OTP"
                type="number"
                value={formData.delaiExpirationOtp}
                onChange={(event) =>
                  onFormChange("delaiExpirationOtp", parseInt(event.target.value, 10) || 0)
                }
                sx={{ width: 180 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Tentatives max"
                type="number"
                value={formData.tentativesMaxOtp}
                onChange={(event) =>
                  onFormChange("tentativesMaxOtp", parseInt(event.target.value, 10) || 0)
                }
                sx={{ width: 160 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Fournisseur SMS OTP"
                select
                fullWidth
                value={formData.fournisseurSmsOtp}
                onChange={(event) => onFormChange("fournisseurSmsOtp", event.target.value)}
              >
                <MenuItem value="twilio">Twilio</MenuItem>
                <MenuItem value="corpsms">CorpSMS DZ</MenuItem>
              </TextField>
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
        open={Boolean(segmentDialog?.open)}
        title="Modifier le segment RFM"
        description="Ajustez les critères, la couleur et l'action automatique de ce segment."
        fields={[
          { key: "segment", label: "Segment" },
          { key: "emoji", label: "Emoji" },
          { key: "criteres", label: "Critères" },
          {
            key: "couleur",
            label: "Couleur",
            type: "select",
            options: [
              { label: "Bleu", value: "bleu" },
              { label: "Vert", value: "vert" },
              { label: "Orange", value: "orange" },
              { label: "Rouge", value: "rouge" }
            ]
          },
          { key: "action", label: "Action auto" }
        ]}
        values={
          segmentDialog?.values ?? {
            segment: "",
            emoji: "",
            criteres: "",
            couleur: "bleu",
            action: ""
          }
        }
        onClose={() => setSegmentDialog(null)}
        onChange={(key, value) =>
          setSegmentDialog((prev) =>
            prev
              ? {
                  ...prev,
                  values: {
                    ...prev.values,
                    [key]: value as string
                  }
                }
              : prev
          )
        }
        onSubmit={() => {
          if (!segmentDialog) return;
          const updated = [...formData.segmentsRfm];
          updated[segmentDialog.index] = segmentDialog.values;
          onFormChange("segmentsRfm", updated);
          onNotify?.("Segment RFM mis à jour");
          setSegmentDialog(null);
        }}
      />
    </Box>
  );
}
