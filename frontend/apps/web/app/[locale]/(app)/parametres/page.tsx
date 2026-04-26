"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import LoadingState from "@/components/ui/LoadingState";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/shared/useToast";
import SettingsTabs from "@/modules/parametres/components/SettingsTabs";
import InformationsSociete from "@/modules/parametres/components/panels/InformationsSociete";
import RegionalLangue from "@/modules/parametres/components/panels/RegionalLangue";
import NotificationsAlertes from "@/modules/parametres/components/panels/NotificationsAlertes";
import GestionCommandes from "@/modules/parametres/components/panels/GestionCommandes";
import LivraisonWilayas from "@/modules/parametres/components/panels/LivraisonWilayas";
import InventaireStock from "@/modules/parametres/components/panels/InventaireStock";
import CrmClients from "@/modules/parametres/components/panels/CrmClients";
import UtilisateursRoles from "@/modules/parametres/components/panels/UtilisateursRoles";
import SecuriteAcces from "@/modules/parametres/components/panels/SecuriteAcces";
import { useParametres } from "@/modules/parametres/hooks/useParametres";
import { useSaveParametres } from "@/modules/parametres/hooks/useSaveParametres";
import type { ParametresFormData, SettingsTabId } from "@/modules/parametres/types";

export default function ParametresPage() {
  const { data, isLoading, isError } = useParametres();
  const saveParametres = useSaveParametres();
  const { toasts, showToast, dismissToast } = useToast();
  const [formData, setFormData] = useState<ParametresFormData | null>(null);
  const [initialData, setInitialData] = useState<ParametresFormData | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTabId>("informations-societe");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setFormData(data.data);
      setInitialData(data.data);
      setHasChanges(false);
    }
  }, [data]);

  const handleFormChange = useCallback(
    (section: keyof ParametresFormData) => (field: string, value: unknown) => {
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      });
      setHasChanges(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!formData) return;
    try {
      setIsSaving(true);
      const response = await saveParametres.mutateAsync(formData);
      setInitialData(response.data);
      setFormData(response.data);
      setHasChanges(false);
      showToast("Paramètres enregistrés", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Impossible d'enregistrer les paramètres",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  }, [formData, saveParametres, showToast]);

  const handleCancel = useCallback(() => {
    if (!initialData) return;
    setFormData(initialData);
    setHasChanges(false);
    showToast("Modifications annulées", "info");
  }, [initialData, showToast]);

  const handleNotify = useCallback(
    (message: string) => {
      showToast(message, "info");
    },
    [showToast]
  );

  const handleLogoChange = useCallback(
    (_logoDataUrl: string) => {
      showToast("Logo mis à jour", "success");
      setHasChanges(true);
    },
    [showToast]
  );

  if (isLoading && !formData) {
    return <LoadingState label="Chargement des paramètres..." />;
  }

  if (isError) {
    return <Alert severity="error">Impossible de charger les paramètres.</Alert>;
  }

  if (!formData) {
    return <LoadingState label="Chargement des paramètres..." />;
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {hasChanges ? (
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid #FDE68A",
            bgcolor: "#FFFBEB",
            p: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <WarningAmberRounded sx={{ color: "#D97706" }} />
            <Typography variant="body2" fontWeight={600} color="#92400E">
              Vous avez des modifications non enregistrées
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={handleCancel}>
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
              sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Stack>
        </Box>
      ) : null}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3
        }}
      >
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <Box flexGrow={1} minWidth={0}>
          {activeTab === "informations-societe" ? (
            <InformationsSociete
              formData={formData.informationsSociete}
              onFormChange={handleFormChange("informationsSociete")}
              onSave={handleSave}
              isSaving={isSaving}
              onLogoChange={handleLogoChange}
            />
          ) : null}

          {activeTab === "regional-langue" ? (
            <RegionalLangue
              formData={formData.regionalLangue}
              onFormChange={handleFormChange("regionalLangue")}
              onSave={handleSave}
              isSaving={isSaving}
            />
          ) : null}

          {activeTab === "notifications" ? (
            <NotificationsAlertes
              formData={formData.notifications}
              onFormChange={handleFormChange("notifications")}
              onSave={handleSave}
              isSaving={isSaving}
              onNotify={handleNotify}
            />
          ) : null}

          {activeTab === "gestion-commandes" ? (
            <GestionCommandes
              formData={formData.gestionCommandes}
              onFormChange={handleFormChange("gestionCommandes")}
              onSave={handleSave}
              isSaving={isSaving}
              onNotify={handleNotify}
            />
          ) : null}

          {activeTab === "livraison-wilayas" ? (
            <LivraisonWilayas
              formData={formData.livraisonWilayas}
              onFormChange={handleFormChange("livraisonWilayas")}
              onSave={handleSave}
              isSaving={isSaving}
              onNotify={handleNotify}
            />
          ) : null}

          {activeTab === "inventaire-stock" ? (
            <InventaireStock
              formData={formData.inventaireStock}
              onFormChange={handleFormChange("inventaireStock")}
              onSave={handleSave}
              isSaving={isSaving}
              onNotify={handleNotify}
            />
          ) : null}

          {activeTab === "crm-clients" ? (
            <CrmClients
              formData={formData.crmClients}
              onFormChange={handleFormChange("crmClients")}
              onSave={handleSave}
              isSaving={isSaving}
              onNotify={handleNotify}
            />
          ) : null}

          {activeTab === "utilisateurs-roles" ? (
            <UtilisateursRoles
              formData={formData.utilisateursRoles}
              onFormChange={handleFormChange("utilisateursRoles")}
              onSave={handleSave}
              isSaving={isSaving}
              onNotify={handleNotify}
            />
          ) : null}

          {activeTab === "securite-acces" ? (
            <SecuriteAcces
              formData={formData.securiteAcces}
              onFormChange={handleFormChange("securiteAcces")}
              onSave={handleSave}
              isSaving={isSaving}
              onNotify={handleNotify}
            />
          ) : null}
        </Box>
      </Box>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open
          message={toast.message}
          severity={toast.severity}
          onClose={() => dismissToast(toast.id)}
        />
      ))}
    </Box>
  );
}
