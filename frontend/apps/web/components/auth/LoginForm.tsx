"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import EmailRounded from "@mui/icons-material/EmailRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import BusinessRounded from "@mui/icons-material/BusinessRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BFFError, postBFF } from "@/lib/fetchBFF";
import { useSession } from "@/providers/SessionProvider";

type LoginResponse = {
  data: {
    token: string;
    expiry: string;
  };
};

type LoginFormProps = {
  locale: string;
};

const GOOGLE_AUTH_URL =
  (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_ENGINE_B_URL : null) ??
  "http://localhost:5220";

export default function LoginForm({ locale }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    tenantId?: string;
  }>({});

  useEffect(() => {
    const googleError = searchParams.get("google_error");
    if (googleError) {
      setError(decodeURIComponent(googleError));
    }
  }, [searchParams]);

  const handleChange =
    (field: "email" | "password" | "tenantId") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (field === "email") setEmail(value);
      if (field === "password") setPassword(value);
      if (field === "tenantId") setTenantId(value);

      setError(null);
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedTenantId = tenantId.trim();
    const nextErrors: { email?: string; password?: string; tenantId?: string } = {};

    if (!trimmedEmail) {
      nextErrors.email = "Adresse email requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Adresse email invalide.";
    }

    if (!password) {
      nextErrors.password = "Mot de passe requis.";
    }

    if (!trimmedTenantId) {
      nextErrors.tenantId = "Identifiant entreprise requis.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await postBFF<LoginResponse, { email: string; password: string; tenantId: string }>(
        "/bff/auth/login",
        {
          email: trimmedEmail,
          password,
          tenantId: trimmedTenantId,
        },
      );

      const nextSession = signIn({
        token: response.data.token,
        expiry: response.data.expiry,
        rememberMe,
      });

      if (!nextSession?.role) {
        setError("Compte authentifie, mais aucun role ERP compatible n'est attribue. Contactez un administrateur.");
        return;
      }

      router.push(`/${locale}/dashboard`);
    } catch (err) {
      if (err instanceof BFFError) {
        if (err.status === 401) {
          setError("Email ou mot de passe invalide.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Service d'authentification indisponible.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={0.8}>
        <Typography variant="h4" fontWeight={800}>
          Connexion
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Accedez a votre espace FERZA
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Stack spacing={2.5}>
        <TextField
          fullWidth
          label="Adresse email"
          placeholder="vous@exemple.dz"
          value={email}
          onChange={handleChange("email")}
          type="email"
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailRounded sx={{ color: "#6B57C2" }} />
              </InputAdornment>
            )
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#D8CFFF"
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6B57C2",
            }
          }}
        />

        <TextField
          fullWidth
          label="Identifiant entreprise"
          placeholder="ferza-dz"
          value={tenantId}
          onChange={handleChange("tenantId")}
          error={Boolean(fieldErrors.tenantId)}
          helperText={fieldErrors.tenantId}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessRounded sx={{ color: "#6B57C2" }} />
              </InputAdornment>
            )
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#D8CFFF"
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6B57C2",
            }
          }}
        />

        <TextField
          fullWidth
          label="Mot de passe"
          placeholder="********"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handleChange("password")}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined sx={{ color: "#6B57C2" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((previous) => !previous)}
                  edge="end"
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? (
                    <VisibilityOffRounded sx={{ color: "#6B57C2" }} />
                  ) : (
                    <VisibilityRounded sx={{ color: "#6B57C2" }} />
                  )}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#D8CFFF"
            },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6B57C2",
            }
          }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
            }
            label="Se souvenir de moi"
          />
          <Button
            type="button"
            disabled
            sx={{
              color: "#6B57C2",
              fontSize: 14,
              fontWeight: 600,
              opacity: 0.7,
              textTransform: "none",
              padding: 0,
              minWidth: "auto",
            }}
          >
            Reinitialisation indisponible
          </Button>
        </Stack>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || isGoogleLoading}
          sx={{
            mt: 1,
            borderRadius: 999,
            paddingY: 1.6,
            fontWeight: 800,
            textTransform: "none",
            background: "linear-gradient(90deg, #4C3A8F 0%, #5A46A6 100%)",
            boxShadow: "0 16px 32px rgba(76, 58, 143, 0.24)",
            "&:hover": {
              background: "linear-gradient(90deg, #44337f 0%, #503f96 100%)",
            }
          }}
        >
          {isSubmitting ? "Connexion en cours..." : "Se connecter"}
        </Button>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            ou continuer avec
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>

        <Button
          type="button"
          variant="outlined"
          disabled={isSubmitting || isGoogleLoading}
          onClick={() => {
            const tid = tenantId.trim();
            if (!tid) {
              setFieldErrors((prev) => ({ ...prev, tenantId: "Identifiant entreprise requis pour Google." }));
              return;
            }
            setIsGoogleLoading(true);
            window.location.href = `${GOOGLE_AUTH_URL}/api/auth/google?tenantId=${encodeURIComponent(tid)}`;
          }}
          sx={{
            borderRadius: 999,
            paddingY: 1.4,
            fontWeight: 700,
            textTransform: "none",
            borderColor: "rgba(76, 58, 143, 0.3)",
            color: "text.primary",
            backgroundColor: "white",
            "&:hover": {
              borderColor: "#4C3A8F",
              backgroundColor: "rgba(76, 58, 143, 0.04)",
            },
          }}
          startIcon={
            <Box
              component="svg"
              viewBox="0 0 24 24"
              sx={{ width: 20, height: 20 }}
              aria-hidden
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </Box>
          }
        >
          {isGoogleLoading ? "Redirection..." : "Continuer avec Google"}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          Vous n&apos;avez pas de compte ?{" "}
          <MuiLink
            component={Link}
            href={`/${locale}/signup`}
            underline="hover"
            sx={{ color: "#4C3A8F", fontWeight: 700 }}
          >
            Creez-en un
          </MuiLink>
        </Typography>
      </Stack>

      <Alert severity="info" sx={{ bgcolor: "rgba(90, 70, 166, 0.06)" }}>
        L&apos;acces depend du role attribue par le backend. Les comptes sans role ERP compatible
        restent bloques apres authentification.
      </Alert>
    </Stack>
  );
}
