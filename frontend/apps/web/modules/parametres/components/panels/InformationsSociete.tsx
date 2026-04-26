"use client";

import { useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import type { InformationsSocieteForm } from "../../types";

const wilayas = [
  "Adrar (01)",
  "Chlef (02)",
  "Laghouat (03)",
  "Oum El Bouaghi (04)",
  "Batna (05)",
  "Béjaïa (06)",
  "Biskra (07)",
  "Béchar (08)",
  "Blida (09)",
  "Bouira (10)",
  "Tamanrasset (11)",
  "Tébessa (12)",
  "Tlemcen (13)",
  "Tiaret (14)",
  "Tizi Ouzou (15)",
  "Alger (16)",
  "Djelfa (17)",
  "Jijel (18)",
  "Sétif (19)",
  "Saïda (20)",
  "Skikda (21)",
  "Sidi Bel Abbès (22)",
  "Annaba (23)",
  "Guelma (24)",
  "Constantine (25)",
  "Médéa (26)",
  "Mostaganem (27)",
  "M'Sila (28)",
  "Mascara (29)",
  "Ouargla (30)",
  "Oran (31)",
  "El Bayadh (32)",
  "Illizi (33)",
  "Bordj Bou Arréridj (34)",
  "Boumerdès (35)",
  "El Tarf (36)",
  "Tindouf (37)",
  "Tissemsilt (38)",
  "El Oued (39)",
  "Khenchela (40)",
  "Souk Ahras (41)",
  "Tipaza (42)",
  "Mila (43)",
  "Aïn Defla (44)",
  "Naâma (45)",
  "Aïn Témouchent (46)",
  "Ghardaïa (47)",
  "Relizane (48)",
  "El M'Ghair (49)",
  "El Meniaa (50)",
  "Ouled Djellal (51)",
  "Bordj Badji Mokhtar (52)",
  "Béni Abbès (53)",
  "Timimoun (54)",
  "Touggourt (55)",
  "Djanet (56)",
  "In Salah (57)",
  "In Guezzam (58)"
];

type InformationsSocieteProps = {
  formData: InformationsSocieteForm;
  onFormChange: (field: keyof InformationsSocieteForm, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onLogoChange: (logoDataUrl: string) => void;
};

export default function InformationsSociete({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onLogoChange
}: InformationsSocieteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      onFormChange("logoDataUrl", result);
      onLogoChange(result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Informations Société
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Configurez les informations de base de votre entreprise
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom de l'entreprise"
                fullWidth
                value={formData.nomEntreprise}
                onChange={(event) => onFormChange("nomEntreprise", event.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Numéro RC"
                fullWidth
                value={formData.numeroRC}
                onChange={(event) => onFormChange("numeroRC", event.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="NIF"
                fullWidth
                value={formData.nif}
                onChange={(event) => onFormChange("nif", event.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="NIS"
                fullWidth
                value={formData.nis}
                onChange={(event) => onFormChange("nis", event.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Adresse"
                fullWidth
                multiline
                minRows={2}
                value={formData.adresse}
                onChange={(event) => onFormChange("adresse", event.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Wilaya principale"
                fullWidth
                select
                value={formData.wilaya}
                onChange={(event) => onFormChange("wilaya", event.target.value)}
              >
                {wilayas.map((wilaya) => (
                  <MenuItem key={wilaya} value={wilaya}>
                    {wilaya}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email contact"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(event) => onFormChange("email", event.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Téléphone"
                fullWidth
                value={formData.telephone}
                onChange={(event) => onFormChange("telephone", event.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Site web"
                fullWidth
                value={formData.siteWeb}
                onChange={(event) => onFormChange("siteWeb", event.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Devise" fullWidth value={formData.devise} disabled />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Logo
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    border: "1px solid #E2E8F0",
                    bgcolor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {formData.logoDataUrl ? (
                    <Box
                      component="img"
                      src={formData.logoDataUrl}
                      alt="Logo société"
                      sx={{ width: 46, height: 46, objectFit: "cover", borderRadius: 1.5 }}
                    />
                  ) : (
                    <Avatar sx={{ bgcolor: "#2563EB", width: 40, height: 40 }}>
                      F
                    </Avatar>
                  )}
                </Box>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileRounded />}
                  onClick={() => inputRef.current?.click()}
                >
                  Changer le logo
                </Button>
              </Box>
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
