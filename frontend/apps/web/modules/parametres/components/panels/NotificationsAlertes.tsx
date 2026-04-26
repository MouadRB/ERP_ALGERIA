"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Switch,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import SmsRounded from "@mui/icons-material/SmsRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SettingsActionDialog from "../SettingsActionDialog";
import type { NotificationsForm } from "../../types";

type NotificationsAlertesProps = {
  formData: NotificationsForm;
  onFormChange: (field: keyof NotificationsForm, value: unknown) => void;
  onSave: () => void;
  isSaving: boolean;
  onNotify?: (message: string) => void;
};

export default function NotificationsAlertes({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onNotify
}: NotificationsAlertesProps) {
  const [templateTab, setTemplateTab] = useState("whatsapp");
  const [editingTemplate, setEditingTemplate] = useState<{
    group: "templatesWhatsapp" | "templatesSms" | "templatesEmail";
    index: number;
    values: { nom: string; preview: string };
  } | null>(null);

  const toggleCanal = (canal: keyof NotificationsForm["canaux"]) => {
    onFormChange("canaux", {
      ...formData.canaux,
      [canal]: !formData.canaux[canal]
    });
  };

  const toggleRegle = (id: string) => {
    const updated = formData.regles.map((regle) =>
      regle.id === id ? { ...regle, actif: !regle.actif } : regle
    );
    onFormChange("regles", updated);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;
    const updated = [...formData[editingTemplate.group]];
    updated[editingTemplate.index] = editingTemplate.values;
    onFormChange(editingTemplate.group, updated);
    onNotify?.("Modèle mis à jour");
    setEditingTemplate(null);
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Notifications & Alertes
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Configurez vos canaux de notification et règles d'alerte
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Canaux de notification
          </Typography>

          <Grid container spacing={2} mt={1}>
            {[
              { key: "inApp", label: "In-App", icon: NotificationsActiveRounded, color: "#2563EB" },
              { key: "email", label: "Email", icon: EmailOutlined, color: "#2563EB" },
              { key: "whatsapp", label: "WhatsApp", icon: WhatsApp, color: "#16A34A" },
              { key: "sms", label: "SMS", icon: SmsRounded, color: "#7C3AED" }
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.key}>
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: "#E2E8F0",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <item.icon fontSize="small" sx={{ color: item.color }} />
                    <Typography variant="body2" fontWeight={600}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Switch
                    checked={formData.canaux[item.key as keyof NotificationsForm["canaux"]]}
                    onChange={() => toggleCanal(item.key as keyof NotificationsForm["canaux"])}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Règles d'alerte
          </Typography>

          <Box mt={2} display="flex" flexDirection="column" gap={1.5}>
            {formData.regles.map((regle) => (
              <Paper
                key={regle.id}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: "#E2E8F0",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Typography variant="body2">{regle.label}</Typography>
                <Switch checked={regle.actif} onChange={() => toggleRegle(regle.id)} />
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Modèles de messages
          </Typography>

          <Tabs
            value={templateTab}
            onChange={(_, value) => setTemplateTab(value)}
            sx={{ mt: 2 }}
          >
            <Tab label="WhatsApp" value="whatsapp" sx={{ textTransform: "none" }} />
            <Tab label="SMS" value="sms" sx={{ textTransform: "none" }} />
            <Tab label="Email" value="email" sx={{ textTransform: "none" }} />
          </Tabs>

          {templateTab === "whatsapp" && (
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              {formData.templatesWhatsapp.map((template) => (
                <Paper key={template.nom} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {template.nom}
                      </Typography>
                      <Box mt={1} sx={{ bgcolor: "#ECFDF3", p: 1.5, borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {template.preview}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlined fontSize="small" />}
                      onClick={() =>
                        setEditingTemplate({
                          group: "templatesWhatsapp",
                          index: formData.templatesWhatsapp.findIndex(
                            (item) => item.nom === template.nom
                          ),
                          values: { ...template }
                        })
                      }
                    >
                      Modifier
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {templateTab === "sms" && (
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              {formData.templatesSms.map((template) => (
                <Paper key={template.nom} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {template.nom}
                      </Typography>
                      <Box mt={1} sx={{ bgcolor: "#F1F5F9", p: 1.5, borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {template.preview}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlined fontSize="small" />}
                      onClick={() =>
                        setEditingTemplate({
                          group: "templatesSms",
                          index: formData.templatesSms.findIndex((item) => item.nom === template.nom),
                          values: { ...template }
                        })
                      }
                    >
                      Modifier
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {templateTab === "email" && (
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              {formData.templatesEmail.map((template) => (
                <Paper key={template.nom} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {template.nom}
                      </Typography>
                      <Box mt={1} sx={{ bgcolor: "#EFF6FF", p: 1.5, borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {template.preview}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlined fontSize="small" />}
                      onClick={() =>
                        setEditingTemplate({
                          group: "templatesEmail",
                          index: formData.templatesEmail.findIndex((item) => item.nom === template.nom),
                          values: { ...template }
                        })
                      }
                    >
                      Modifier
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
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
        open={Boolean(editingTemplate)}
        title="Modifier le modèle"
        description="Mettez à jour le nom et le contenu visible dans l'aperçu."
        fields={[
          { key: "nom", label: "Nom" },
          { key: "preview", label: "Aperçu", type: "textarea" }
        ]}
        values={editingTemplate?.values ?? { nom: "", preview: "" }}
        onClose={() => setEditingTemplate(null)}
        onChange={(key, value) =>
          setEditingTemplate((prev) =>
            prev
              ? {
                  ...prev,
                  values: {
                    ...prev.values,
                    [key]: value
                  }
                }
              : prev
          )
        }
        onSubmit={saveTemplate}
      />
    </Box>
  );
}
