"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import PhoneIphoneRounded from "@mui/icons-material/PhoneIphoneRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postBFF } from "@/lib/fetchBFF";

type RoleOption = {
  id: string;
  label: string;
  mfaRequired: boolean;
};

const ROLE_OPTIONS: RoleOption[] = [
  { id: "super_admin", label: "Super Admin", mfaRequired: true },
  { id: "product_manager", label: "Product Manager", mfaRequired: false },
  { id: "inventory_manager", label: "Inventory Manager", mfaRequired: false },
  { id: "procurement_manager", label: "Procurement Manager", mfaRequired: true },
  { id: "crm_manager", label: "CRM Manager", mfaRequired: false },
  { id: "warehouse_operator", label: "Warehouse Operator", mfaRequired: false }
];

type LoginResponse = {
  data: {
    user: {
      id: string;
      name: string;
      role: string;
      label: string;
      phone: string;
      mfaRequired: boolean;
    };
    token: string;
  };
};

type LoginFormProps = {
  locale: string;
};

export default function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();

  const [role, setRole] = useState(ROLE_OPTIONS[0]?.id ?? "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => ROLE_OPTIONS.find((item) => item.id === role) ?? ROLE_OPTIONS[0],
    [role]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        role,
        phone: phone.trim(),
        password,
        mfaCode: selectedRole?.mfaRequired ? mfaCode.trim() : undefined
      };

      const response = await postBFF<LoginResponse>("/bff/auth/login", payload);

      if (typeof window !== "undefined") {
        localStorage.setItem("ferza.mock.user", JSON.stringify(response.data.user));
        localStorage.setItem("ferza.mock.token", response.data.token);

        const isSecure = window.location.protocol === "https:";
        const cookieParts = [
          `ferza_session=${encodeURIComponent(response.data.token)}`,
          "Path=/",
          "SameSite=Lax",
          "Max-Age=604800"
        ];
        if (isSecure) cookieParts.push("Secure");
        document.cookie = cookieParts.join("; ");
      }

      router.push(`/${locale}/dashboard`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "BFF request failed";
      if (message === "Invalid credentials") {
        setError("Identifiants invalides.");
      } else if (message === "MFA code required") {
        setError("Code MFA requis.");
      } else {
        setError("BFF indisponible.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack spacing={0.6} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Connexion
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Accedez a votre espace de travail FERZA
        </Typography>
      </Stack>

      <Stack component="form" spacing={2.2} onSubmit={handleSubmit}>
        <FormControl fullWidth>
          <InputLabel id="role-label">Role d&apos;acces</InputLabel>
          <Select
            labelId="role-label"
            value={role}
            onChange={(event: SelectChangeEvent<string>) => setRole(event.target.value)}
            input={
              <OutlinedInput
                label="Role d&apos;acces"
                startAdornment={
                  <InputAdornment position="start">
                    <PersonOutlineRounded sx={{ color: "#7B6BC6" }} />
                  </InputAdornment>
                }
              />
            }
            renderValue={(selected) => {
              const current = ROLE_OPTIONS.find((item) => item.id === selected);
              if (!current) return selected;
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {current.label}
                  </Typography>
                  {current.mfaRequired && (
                    <Chip
                      label="MFA"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: "#EEE8FF",
                        color: "#6A5ACD"
                      }}
                    />
                  )}
                </Box>
              );
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#DAD5F0"
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6B5BBF",
                boxShadow: "0 0 0 3px rgba(107, 91, 191, 0.15)"
              }
            }}
          >
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%"
                  }}
                >
                  <Typography variant="body2">{option.label}</Typography>
                  {option.mfaRequired && (
                    <Chip
                      label="MFA"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: "#EEE8FF",
                        color: "#6A5ACD"
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Numero de telephone"
          placeholder="+213 0XX XXX XXX"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          type="tel"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIphoneRounded sx={{ color: "#7B6BC6" }} />
              </InputAdornment>
            )
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E3E0F5"
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6B5BBF",
              boxShadow: "0 0 0 3px rgba(107, 91, 191, 0.15)"
            }
          }}
        />

        <FormControl
          fullWidth
          sx={{
            position: "relative",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#E3E0F5"
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6B5BBF",
              boxShadow: "0 0 0 3px rgba(107, 91, 191, 0.15)"
            }
          }}
        >
          <InputLabel htmlFor="password-input">Mot de passe</InputLabel>
          <OutlinedInput
            id="password-input"
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <LockOutlined sx={{ color: "#7B6BC6" }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? (
                    <VisibilityOffRounded sx={{ color: "#7B6BC6" }} />
                  ) : (
                    <VisibilityRounded sx={{ color: "#7B6BC6" }} />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
          <Typography
            component={Link}
            href="#"
            variant="caption"
            sx={{
              position: "absolute",
              right: 8,
              top: -10,
              color: "#6B5BBF",
              fontWeight: 600,
              textDecoration: "none",
              backgroundColor: "#FFFFFF",
              paddingX: 0.5
            }}
          >
            Mot de passe oublie ?
          </Typography>
        </FormControl>

        {selectedRole?.mfaRequired && (
          <TextField
            fullWidth
            label="Code MFA (TOTP / SMS OTP)"
            placeholder="000 000"
            value={mfaCode}
            onChange={(event) => setMfaCode(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ShieldRounded sx={{ color: "#7B6BC6" }} />
                </InputAdornment>
              )
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E3E0F5"
              },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#6B5BBF",
                boxShadow: "0 0 0 3px rgba(107, 91, 191, 0.15)"
              }
            }}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: "#4D3C8B",
            borderRadius: 2,
            paddingY: 1.4,
            fontWeight: 700,
            "&:hover": { backgroundColor: "#43337A" }
          }}
        >
          SE CONNECTER
        </Button>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Typography variant="caption" color="text.secondary">
            Vous n&apos;avez pas de compte ?
          </Typography>
          <Button
            component={Link}
            href={`/${locale}/signup`}
            variant="text"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "#6B5BBF",
              padding: 0,
              minWidth: "auto"
            }}
          >
            S&apos;inscrire
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          backgroundColor: "#EFE9FF",
          display: "flex",
          alignItems: "center",
          gap: 1.5
        }}
      >
        <ShieldRounded sx={{ color: "#6B5BBF" }} />
        <Typography variant="caption" fontWeight={600} color="#4C3D8B">
          MFA obligatoire : Super Admin - Procurement Manager
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2, textAlign: "center" }}
      >
        (c) 2026 FERZA - Donnees hebergees en Algerie - Loi 18-07 conforme
      </Typography>
    </>
  );
}
