"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
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
import PersonRounded from "@mui/icons-material/PersonRounded";
import EmailRounded from "@mui/icons-material/EmailRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import BusinessRounded from "@mui/icons-material/BusinessRounded";
import VpnKeyRounded from "@mui/icons-material/VpnKeyRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BFFError, postBFF } from "@/lib/fetchBFF";
import { useSession } from "@/providers/SessionProvider";

type RegisterResponse = {
  data: {
    token: string;
    expiry: string;
  };
};

type RegisterFormProps = {
  locale: string;
};

const GOOGLE_AUTH_URL =
  (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_ENGINE_B_URL : null) ??
  "http://localhost:5220";

const PASSWORD_HINTS = [
  { id: "length", label: "8 caracteres minimum", test: (value: string) => value.length >= 8 },
  { id: "uppercase", label: "1 majuscule", test: (value: string) => /[A-Z]/.test(value) },
  { id: "digit", label: "1 chiffre", test: (value: string) => /\d/.test(value) },
  { id: "symbol", label: "1 caractere special", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export default function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const { signIn } = useSession();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    tenantId?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});

  const passwordChecks = useMemo(
    () => PASSWORD_HINTS.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  );

  const updateField =
    (field: "fullName" | "email" | "tenantId" | "inviteToken" | "password" | "confirmPassword") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (field === "fullName") setFullName(value);
      if (field === "email") setEmail(value);
      if (field === "tenantId") setTenantId(value);
      if (field === "inviteToken") setInviteToken(value);
      if (field === "password") setPassword(value);
      if (field === "confirmPassword") setConfirmPassword(value);

      setError(null);
      setSuccess(null);
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedTenantId = tenantId.trim();
    const trimmedInviteToken = inviteToken.trim();
    const nextErrors: typeof fieldErrors = {};

    if (!trimmedName) {
      nextErrors.fullName = "Nom complet requis.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Adresse email requise.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Adresse email invalide.";
    }

    if (!trimmedTenantId) {
      nextErrors.tenantId = "Identifiant entreprise requis.";
    }

    if (!password) {
      nextErrors.password = "Mot de passe requis.";
    } else if (!passwordChecks.every((rule) => rule.passed)) {
      nextErrors.password = "Le mot de passe ne respecte pas les regles backend.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirmation requise.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    if (!acceptTerms) {
      nextErrors.acceptTerms = "Vous devez accepter les conditions.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await postBFF<
        RegisterResponse,
        { fullName: string; email: string; password: string; tenantId: string; inviteToken?: string }
      >("/bff/auth/register", {
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        tenantId: trimmedTenantId,
        ...(trimmedInviteToken ? { inviteToken: trimmedInviteToken } : {}),
      });

      const nextSession = signIn({
        token: response.data.token,
        expiry: response.data.expiry,
        rememberMe: true,
      });

      if (!nextSession?.role) {
        setSuccess(
          "Compte cree avec succes. Le backend attribue actuellement un role non compatible avec l'ERP web. Demandez a un administrateur de vous assigner un role avant la connexion.",
        );
        return;
      }

      router.push(`/${locale}/dashboard`);
    } catch (err) {
      if (err instanceof BFFError) {
        setError(err.message);
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
          Creer un compte
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enregistrez-vous puis faites attribuer un role ERP si necessaire.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Stack spacing={2.5}>
        <TextField
          fullWidth
          label="Nom complet"
          placeholder="Jean Dupont"
          value={fullName}
          onChange={updateField("fullName")}
          error={Boolean(fieldErrors.fullName)}
          helperText={fieldErrors.fullName}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonRounded sx={{ color: "#6B57C2" }} />
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
          label="Adresse email"
          placeholder="vous@exemple.dz"
          value={email}
          onChange={updateField("email")}
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
          onChange={updateField("tenantId")}
          error={Boolean(fieldErrors.tenantId)}
          helperText={fieldErrors.tenantId ?? "Identifiant unique de votre entreprise (ex: ferza-dz)"}
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
          onChange={updateField("password")}
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

        <TextField
          fullWidth
          label="Confirmer le mot de passe"
          placeholder="********"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={updateField("confirmPassword")}
          error={Boolean(fieldErrors.confirmPassword)}
          helperText={fieldErrors.confirmPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined sx={{ color: "#6B57C2" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((previous) => !previous)}
                  edge="end"
                  aria-label="Afficher la confirmation du mot de passe"
                >
                  {showConfirmPassword ? (
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

        <Stack spacing={1} sx={{ px: 0.25 }}>
          {passwordChecks.map((rule) => (
            <Typography
              key={rule.id}
              variant="caption"
              sx={{ color: rule.passed ? "success.main" : "text.secondary" }}
            >
              - {rule.label}
            </Typography>
          ))}
        </Stack>

        <TextField
          fullWidth
          label="Jeton d'invitation (optionnel)"
          placeholder="Collé ici si vous avez recu un jeton"
          value={inviteToken}
          onChange={updateField("inviteToken")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VpnKeyRounded sx={{ color: "#6B57C2" }} />
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

        <FormControlLabel
          control={
            <Checkbox
              checked={acceptTerms}
              onChange={(event) => {
                setAcceptTerms(event.target.checked);
                setFieldErrors((current) => ({ ...current, acceptTerms: undefined }));
              }}
            />
          }
          label="J'accepte les conditions d'utilisation FERZA."
        />

        {fieldErrors.acceptTerms && (
          <Typography variant="caption" color="error">
            {fieldErrors.acceptTerms}
          </Typography>
        )}

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
          {isSubmitting ? "Creation en cours..." : "Creer un compte"}
        </Button>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            ou s&apos;inscrire avec
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
            const params = new URLSearchParams({ tenantId: tid });
            const tok = inviteToken.trim();
            if (tok) params.set("inviteToken", tok);
            window.location.href = `${GOOGLE_AUTH_URL}/api/auth/google?${params}`;
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
          Vous avez deja un compte ?{" "}
          <MuiLink
            component={Link}
            href={`/${locale}/login`}
            underline="hover"
            sx={{ color: "#4C3A8F", fontWeight: 700 }}
          >
            Connectez-vous
          </MuiLink>
        </Typography>
      </Stack>
    </Stack>
  );
}
