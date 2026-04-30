"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PowerSettingsNewOutlined from "@mui/icons-material/PowerSettingsNewOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import SettingsActionDialog from "../SettingsActionDialog";
import type { UtilisateursRolesForm } from "../../types";

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
    setUserDialog({
      open: true,
      index: null,
      values: {
        initiales: "NU",
        nom: "",
        email: "",
        role: "Agent",
        statut: "actif",
        derniereConnexion: "À l'instant"
      }
    });
  };

  const toggleUserStatus = (index: number) => {
    const updated = [...formData.utilisateurs];
    const current = updated[index];
    updated[index] = {
      ...current,
      statut: current.statut === "actif" ? "inactif" : "actif"
    };
    onFormChange("utilisateurs", updated);
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
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Dernière connexion</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.utilisateurs.map((user, index) => (
                <TableRow key={`${user.email}-${index}`}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor:
                            user.role === "Super Admin"
                              ? "#2563EB"
                              : user.role === "Superviseur"
                              ? "#7C3AED"
                              : "#16A34A",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      >
                        {user.initiales}
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {user.nom}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{user.email}</TableCell>
                  <TableCell>
                    <Chip size="small" label={user.role} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.statut === "actif" ? "🟢" : "🟡"}
                      variant="outlined"
                      sx={{
                        borderColor: user.statut === "actif" ? "#BBF7D0" : "#FED7AA",
                        bgcolor: user.statut === "actif" ? "#F0FDF4" : "#FFF7ED",
                        color: user.statut === "actif" ? "#15803D" : "#B45309"
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{user.derniereConnexion}</TableCell>
                  <TableCell>
                    {user.role !== "Super Admin" ? (
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setUserDialog({
                              open: true,
                              index,
                              values: { ...user }
                            })
                          }
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => toggleUserStatus(index)}>
                          <PowerSettingsNewOutlined fontSize="small" sx={{ color: "#DC2626" }} />
                        </IconButton>
                      </Stack>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
