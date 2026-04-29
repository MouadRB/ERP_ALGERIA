"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import SettingsActionDialog from "../SettingsActionDialog";
import { BFFError, fetchBFF, postBFF } from "@/lib/fetchBFF";
import type { UtilisateursRolesForm } from "../../types";
import type { ApiResponse } from "@ferza/shared";

type TenantUser = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  createdAt: string;
};

function getInitials(fullName: string, email: string): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const ASSIGNABLE_ROLES = [
  "ProductManager",
  "InventoryManager",
  "FinanceManager",
  "WarehouseOperator",
  "ProcurementManager",
  "CRMAgent",
  "LogisticsAgent",
  "ReportingAnalyst",
];

type UtilisateursRolesProps = {
  formData: UtilisateursRolesForm;
  onFormChange: (field: keyof UtilisateursRolesForm, value: unknown) => void;
  onSave: () => void;
  isSaving: boolean;
  onNotify?: (message: string) => void;
};

export default function UtilisateursRoles({
  formData,
  onFormChange,
  onSave,
  isSaving,
  onNotify
}: UtilisateursRolesProps) {
  const queryClient = useQueryClient();
  const { data: usersData, isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ["tenants", "users"],
    queryFn: () => fetchBFF<ApiResponse<TenantUser[]>>("/bff/tenants/users"),
  });
  const tenantUsers = usersData?.data ?? [];

  const [inviteDialog, setInviteDialog] = useState<{
    open: boolean;
    email: string;
    roles: string[];
    isSubmitting: boolean;
    error: string | null;
    success: string | null;
  }>({
    open: false,
    email: "",
    roles: [],
    isSubmitting: false,
    error: null,
    success: null,
  });

  const [userDialog, setUserDialog] = useState<{
    open: boolean;
    index: number | null;
    values: {
      initiales: string;
      nom: string;
      email: string;
      role: string;
      statut: string;
      derniereConnexion: string;
    };
  }>({
    open: false,
    index: null,
    values: {
      initiales: "",
      nom: "",
      email: "",
      role: "Agent",
      statut: "actif",
      derniereConnexion: "À l'instant"
    }
  });
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    index: number | null;
    values: {
      nom: string;
      description: string;
      permissionCount: number;
      type: string;
    };
  }>({
    open: false,
    index: null,
    values: {
      nom: "",
      description: "",
      permissionCount: 0,
      type: "Personnalisé"
    }
  });
  const [permissionsDialog, setPermissionsDialog] = useState<{
    open: boolean;
    roleName: string;
    permissions: string[];
  }>({
    open: false,
    roleName: "",
    permissions: []
  });

  const addUtilisateur = () => {
    setInviteDialog({ open: true, email: "", roles: [], isSubmitting: false, error: null, success: null });
  };

  const handleInviteSubmit = async () => {
    const trimmedEmail = inviteDialog.email.trim();
    if (!trimmedEmail || inviteDialog.roles.length === 0) {
      setInviteDialog((prev) => ({ ...prev, error: "Email et au moins un rôle sont requis." }));
      return;
    }
    setInviteDialog((prev) => ({ ...prev, isSubmitting: true, error: null, success: null }));
    try {
      await postBFF("/bff/tenants/invites", { email: trimmedEmail, roles: inviteDialog.roles });
      setInviteDialog((prev) => ({ ...prev, isSubmitting: false, success: `Invitation envoyée à ${trimmedEmail}.`, email: "", roles: [] }));
      onNotify?.(`Invitation envoyée à ${trimmedEmail}`);
      await queryClient.invalidateQueries({ queryKey: ["tenants", "users"] });
    } catch (err) {
      const message = err instanceof BFFError ? err.message : "Erreur lors de l'envoi de l'invitation.";
      setInviteDialog((prev) => ({ ...prev, isSubmitting: false, error: message }));
    }
  };

  const addRole = () => {
    setRoleDialog({
      open: true,
      index: null,
      values: {
        nom: "",
        description: "",
        permissionCount: 0,
        type: "Personnalisé"
      }
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="#0F172A">
          Utilisateurs & Rôles
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Gérez les utilisateurs et leurs permissions
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Utilisateurs actifs
          </Typography>
          {usersLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : usersError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              Impossible de charger les utilisateurs.
            </Alert>
          ) : (
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôles</TableCell>
                  <TableCell>Membre depuis</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenantUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: user.roles.includes("SuperAdmin") ? "#2563EB" : "#16A34A",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 12
                          }}
                        >
                          {getInitials(user.fullName, user.email)}
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {user.fullName || user.email}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{user.email}</TableCell>
                    <TableCell>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {user.roles.map((role) => (
                          <Chip key={role} size="small" label={role} variant="outlined" />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {new Date(user.createdAt).toLocaleDateString("fr-DZ")}
                    </TableCell>
                  </TableRow>
                ))}
                {tenantUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: "text.secondary", py: 3 }}>
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            sx={{ mt: 2, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
            onClick={addUtilisateur}
          >
            Inviter un utilisateur
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Rôles & Permissions
          </Typography>
          <Grid container spacing={2} mt={1}>
            {formData.roles.map((role, index) => (
              <Grid item xs={12} md={4} key={`${role.nom}-${index}`}>
                <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "#E2E8F0" }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="subtitle2" fontWeight={700}>
                        {role.nom}
                      </Typography>
                      <Chip
                        size="small"
                        label={role.type}
                        variant="outlined"
                        sx={{
                          borderColor:
                            role.type === "Système"
                              ? "#BFDBFE"
                              : role.type === "Personnalisé"
                              ? "#E9D5FF"
                              : "#FED7AA",
                          bgcolor:
                            role.type === "Système"
                              ? "#EFF6FF"
                              : role.type === "Personnalisé"
                              ? "#F3E8FF"
                              : "#FFF7ED",
                          color:
                            role.type === "Système"
                              ? "#2563EB"
                              : role.type === "Personnalisé"
                              ? "#7C3AED"
                              : "#B45309"
                        }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {role.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" mt={1} display="block">
                      {role.permissionCount} permissions
                    </Typography>
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityOutlined fontSize="small" />}
                        onClick={() =>
                          setPermissionsDialog({
                            open: true,
                            roleName: role.nom,
                            permissions: Array.from(
                              { length: Math.min(role.permissionCount, 12) },
                              (_, permissionIndex) =>
                                `${role.nom} · permission ${permissionIndex + 1}`
                            )
                          })
                        }
                      >
                        Voir permissions
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditOutlined fontSize="small" />}
                        onClick={() =>
                          setRoleDialog({
                            open: true,
                            index,
                            values: { ...role }
                          })
                        }
                      >
                        Modifier
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Button variant="outlined" startIcon={<AddRounded />} sx={{ mt: 2 }} onClick={addRole}>
            Créer un rôle
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

      {/* Real invite dialog — calls POST /bff/tenants/invites */}
      <Dialog
        open={inviteDialog.open}
        onClose={() => !inviteDialog.isSubmitting && setInviteDialog((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Inviter un utilisateur</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Un email avec le jeton d&apos;invitation sera envoyé au collaborateur.
            </Typography>

            {inviteDialog.error && <Alert severity="error">{inviteDialog.error}</Alert>}
            {inviteDialog.success && <Alert severity="success">{inviteDialog.success}</Alert>}

            <TextField
              fullWidth
              label="Adresse email"
              type="email"
              value={inviteDialog.email}
              onChange={(e) => setInviteDialog((prev) => ({ ...prev, email: e.target.value, error: null }))}
              disabled={inviteDialog.isSubmitting}
            />

            <Box>
              <InputLabel shrink sx={{ mb: 0.5, fontWeight: 600 }}>
                Rôles assignés
              </InputLabel>
              <Select
                multiple
                fullWidth
                value={inviteDialog.roles}
                onChange={(e: SelectChangeEvent<string[]>) => {
                  const val = e.target.value;
                  setInviteDialog((prev) => ({
                    ...prev,
                    roles: typeof val === "string" ? val.split(",") : val,
                    error: null,
                  }));
                }}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {(selected as string[]).map((role) => (
                      <Chip key={role} label={role} size="small" />
                    ))}
                  </Stack>
                )}
                disabled={inviteDialog.isSubmitting}
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setInviteDialog((prev) => ({ ...prev, open: false }))}
            disabled={inviteDialog.isSubmitting}
          >
            {inviteDialog.success ? "Fermer" : "Annuler"}
          </Button>
          {!inviteDialog.success && (
            <Button
              variant="contained"
              onClick={handleInviteSubmit}
              disabled={inviteDialog.isSubmitting}
              sx={{ bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
            >
              {inviteDialog.isSubmitting ? "Envoi..." : "Envoyer l'invitation"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <SettingsActionDialog
        open={userDialog.open}
        title={userDialog.index === null ? "Inviter un utilisateur" : "Modifier l'utilisateur"}
        description="Renseignez les informations du collaborateur et son rôle."
        fields={[
          { key: "initiales", label: "Initiales" },
          { key: "nom", label: "Nom complet" },
          { key: "email", label: "Email", type: "email" },
          {
            key: "role",
            label: "Rôle",
            type: "select",
            options: [
              { label: "Super Admin", value: "Super Admin" },
              { label: "Superviseur", value: "Superviseur" },
              { label: "Agent", value: "Agent" }
            ]
          },
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
        values={userDialog.values}
        onClose={() => setUserDialog((prev) => ({ ...prev, open: false }))}
        onChange={(key, value) =>
          setUserDialog((prev) => ({
            ...prev,
            values: {
              ...prev.values,
              [key]: value as string
            }
          }))
        }
        onSubmit={() => {
          const updated = [...formData.utilisateurs];
          if (userDialog.index === null) {
            updated.push(userDialog.values);
            onNotify?.("Invitation préparée");
          } else {
            updated[userDialog.index] = userDialog.values;
            onNotify?.("Utilisateur mis à jour");
          }
          onFormChange("utilisateurs", updated);
          setUserDialog((prev) => ({ ...prev, open: false }));
        }}
      />

      <SettingsActionDialog
        open={roleDialog.open}
        title={roleDialog.index === null ? "Créer un rôle" : "Modifier le rôle"}
        description="Définissez la description et le volume de permissions du rôle."
        fields={[
          { key: "nom", label: "Nom du rôle" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "permissionCount", label: "Nombre de permissions", type: "number" },
          {
            key: "type",
            label: "Type",
            type: "select",
            options: [
              { label: "Système", value: "Système" },
              { label: "Personnalisé", value: "Personnalisé" },
              { label: "Restreint", value: "Restreint" }
            ]
          }
        ]}
        values={roleDialog.values}
        onClose={() => setRoleDialog((prev) => ({ ...prev, open: false }))}
        onChange={(key, value) =>
          setRoleDialog((prev) => ({
            ...prev,
            values: {
              ...prev.values,
              [key]: value
            }
          }))
        }
        onSubmit={() => {
          const updated = [...formData.roles];
          if (roleDialog.index === null) {
            updated.push(roleDialog.values);
            onNotify?.("Rôle créé");
          } else {
            updated[roleDialog.index] = roleDialog.values;
            onNotify?.("Rôle mis à jour");
          }
          onFormChange("roles", updated);
          setRoleDialog((prev) => ({ ...prev, open: false }));
        }}
      />

      <Dialog
        open={permissionsDialog.open}
        onClose={() => setPermissionsDialog((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Permissions · {permissionsDialog.roleName}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            {permissionsDialog.permissions.map((permission) => (
              <Chip key={permission} label={permission} variant="outlined" sx={{ width: "fit-content" }} />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsDialog((prev) => ({ ...prev, open: false }))}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
