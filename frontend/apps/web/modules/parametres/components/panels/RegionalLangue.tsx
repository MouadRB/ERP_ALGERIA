"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@mui/material";
import type { RegionalLangueForm } from "../../types";

const jours = [
  { id: "dim", label: "Dim" },
  { id: "lun", label: "Lun" },
  { id: "mar", label: "Mar" },
  { id: "mer", label: "Mer" },
  { id: "jeu", label: "Jeu" },
  { id: "ven", label: "Ven" },
  { id: "sam", label: "Sam" }
];

type RegionalLangueProps = {
  formData: RegionalLangueForm;
  onFormChange: (field: keyof RegionalLangueForm, value: string | string[]) => void;
  onSave: () => void;
  isSaving: boolean;
};

export default function RegionalLangue({
  formData,
  onFormChange,
  onSave,
  isSaving
}: RegionalLangueProps) {
  const toggleJour = (jour: string) => {
    const newJours = formData.joursOuvres.includes(jour)
      ? formData.joursOuvres.filter((j) => j !== jour)
      : [...formData.joursOuvres, jour];
    onFormChange("joursOuvres", newJours);
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Régional & Langue
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Configurez les paramètres régionaux et linguistiques
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Langue de l'interface"
                select
                fullWidth
                value={formData.langue}
                onChange={(event) => onFormChange("langue", event.target.value)}
              >
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Fuseau horaire"
                select
                fullWidth
                value={formData.fuseau}
                onChange={(event) => onFormChange("fuseau", event.target.value)}
              >
                <MenuItem value="Africa/Algiers">Africa/Algiers (UTC+1)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Format de date
                </Typography>
                <RadioGroup
                  value={formData.formatDate}
                  onChange={(event) => onFormChange("formatDate", event.target.value)}
                >
                  <FormControlLabel value="DD/MM/YYYY" control={<Radio />} label="DD/MM/YYYY" />
                  <FormControlLabel value="MM/DD/YYYY" control={<Radio />} label="MM/DD/YYYY" />
                  <FormControlLabel value="YYYY-MM-DD" control={<Radio />} label="YYYY-MM-DD" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Format de nombre
                </Typography>
                <RadioGroup
                  value={formData.formatNombre}
                  onChange={(event) => onFormChange("formatNombre", event.target.value)}
                >
                  <FormControlLabel
                    value="fr"
                    control={<Radio />}
                    label="1 234 567,89 DZD"
                  />
                  <FormControlLabel
                    value="en"
                    control={<Radio />}
                    label="1,234,567.89 DZD"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Séparateur décimal"
                select
                fullWidth
                value={formData.separateurDecimal}
                onChange={(event) => onFormChange("separateurDecimal", event.target.value)}
              >
                <MenuItem value="virgule">Virgule (,)</MenuItem>
                <MenuItem value="point">Point (.)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Calendrier fiscal"
                fullWidth
                value={formData.calendrierFiscal}
                onChange={(event) =>
                  onFormChange("calendrierFiscal", event.target.value)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Jours ouvrés
              </Typography>
              <FormGroup row>
                {jours.map((jour) => (
                  <FormControlLabel
                    key={jour.id}
                    control={
                      <Checkbox
                        checked={formData.joursOuvres.includes(jour.id)}
                        onChange={() => toggleJour(jour.id)}
                      />
                    }
                    label={jour.label}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>

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
        </CardContent>
      </Card>
    </Box>
  );
}
