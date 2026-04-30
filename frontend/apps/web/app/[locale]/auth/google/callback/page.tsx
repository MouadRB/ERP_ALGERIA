"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useSession } from "@/providers/SessionProvider";

type PageProps = {
  params: { locale: string };
};

export default function GoogleCallbackPage({ params }: PageProps) {
  const { locale } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useSession();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get("token");
    const expiry = searchParams.get("expiry");
    const error = searchParams.get("error");

    if (error || !token) {
      const errorMap: Record<string, string> = {
        google_auth_failed: "L'authentification Google a echoue.",
        no_email: "Impossible de recuperer l'email depuis Google.",
        user_creation_failed: "La creation du compte a echoue.",
      };
      const message = (error && errorMap[error]) || "Authentification Google echouee.";
      router.replace(`/${locale}/login?google_error=${encodeURIComponent(message)}`);
      return;
    }

    const session = signIn({ token, expiry, rememberMe: true });

    if (!session?.role) {
      router.replace(
        `/${locale}/login?google_error=${encodeURIComponent("Compte cree. Aucun role ERP attribue. Contactez un administrateur.")}`
      );
      return;
    }

    router.replace(`/${locale}/dashboard`);
  }, [locale, router, searchParams, signIn]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        background: "linear-gradient(180deg, #F3F4F8 0%, #F7F5FC 100%)",
      }}
    >
      <CircularProgress sx={{ color: "#4C3A8F" }} size={48} />
      <Typography variant="body1" color="text.secondary">
        Authentification Google en cours...
      </Typography>
    </Box>
  );
}
