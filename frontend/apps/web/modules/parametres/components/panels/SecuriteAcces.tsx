"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import type { SecuriteAccesForm } from "../../types";

type SecuriteAccesProps = {
  formData: SecuriteAccesForm;
  onFormChange: (field: keyof SecuriteAccesForm, value: unknown) => void;
  onSave: () => void;
  isSaving: boolean;
  onNotify?: (message: string) => void;
};

export default function SecuriteAcces({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onNotify
}: SecuriteAccesProps) {
  const terminateSession = (index: number) => {
    const updated = formData.sessions.filter((_, idx) => idx !== index);
    onFormChange("sessions", updated);
    onNotify?.("Session terminée");
  };

  const terminateOtherSessions = () => {
    const updated = formData.sessions.filter((session) => session.courante);
    onFormChange("sessions", updated);
    onNotify?.("Autres sessions terminées");
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Sécurité & Accès
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Configurez les politiques de sécurité de votre compte
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Politique de mot de passe
          </Typography>
          <Box mt={3} display="flex" flexDirection="column" gap={3}>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Longueur minimale</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formData.longueurMinMdp} caractères
                </Typography>
              </Box>
              <Slider
                sx={{ mt: 2 }}
                value={formData.longueurMinMdp}
                onChange={(_, value) => onFormChange("longueurMinMdp", value as number)}
                min={6}
                max={20}
                step={1}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.majusculeRequise}
                  onChange={(event) => onFormChange("majusculeRequise", event.target.checked)}
                />
              }
              label="Majuscule requise"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.caractereSpecialRequis}
                  onChange={(event) =>
                    onFormChange("caractereSpecialRequis", event.target.checked)
                  }
                />
              }
              label="Caractère spécial requis"
            />

            <TextField
              label="Expiration"
              select
              value={formData.expirationMdp}
              onChange={(event) => onFormChange("expirationMdp", event.target.value)}
              sx={{ width: 220 }}
            >
              <MenuItem value="30">30 jours</MenuItem>
              <MenuItem value="60">60 jours</MenuItem>
              <MenuItem value="90">90 jours</MenuItem>
              <MenuItem value="180">180 jours</MenuItem>
              <MenuItem value="jamais">Jamais</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              Authentification à deux facteurs
            </Typography>
            <Switch
              checked={formData.deuxFacteursObligatoire}
              onChange={(event) =>
                onFormChange("deuxFacteursObligatoire", event.target.checked)
              }
            />
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Exiger 2FA pour tous les administrateurs
          </Typography>

          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Méthode
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={formData.methode2fa}
                onChange={(event) => onFormChange("methode2fa", event.target.value)}
              >
                <FormControlLabel
                  value="authenticator"
                  control={<Radio />}
                  label="Application Authenticator"
                />
                <FormControlLabel value="sms" control={<Radio />} label="SMS OTP" />
              </RadioGroup>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Sessions actives
          </Typography>
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Appareil</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Localisation</TableCell>
                <TableCell>Débuté</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.sessions.map((session, index) => (
                <TableRow key={`${session.appareil}-${index}`}>
                  <TableCell>{session.appareil}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{session.ip}</TableCell>
                  <TableCell>{session.localisation}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{session.debut}</TableCell>
                  <TableCell>
                    {session.courante ? (
                      <Chip
                        size="small"
                        label="Session courante"
                        variant="outlined"
                        sx={{ borderColor: "#BBF7D0", bgcolor: "#F0FDF4", color: "#15803D" }}
                      />
                    ) : (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => terminateSession(index)}
                      >
                        Terminer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={terminateOtherSessions}
          >
            Terminer toutes les autres sessions
          </Button>
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
    </Box>
  );
}
