"use client";

import { Box, Paper } from "@mui/material";
import { useParams } from "next/navigation";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "fr";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#F5F6FA"
      }}
    >
      <AuthLeftPanel />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: { xs: 3, md: 6 }
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 3,
            padding: { xs: 3, md: 4 },
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              backgroundColor: "#4D3C8B"
            }}
          />

          <LoginForm locale={locale} />
        </Paper>
      </Box>
    </Box>
  );
}
