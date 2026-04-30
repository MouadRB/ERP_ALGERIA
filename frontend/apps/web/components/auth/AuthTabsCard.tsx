"use client";

import { Paper, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

type AuthTabsCardProps = {
  activeTab: "login" | "register";
  locale: string;
};

export default function AuthTabsCard({ activeTab, locale }: AuthTabsCardProps) {
  const router = useRouter();

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 520,
        borderRadius: 5,
        border: "1px solid rgba(76, 58, 143, 0.12)",
        backgroundColor: "rgba(255,255,255,0.94)",
        boxShadow: "0 30px 70px rgba(76, 58, 143, 0.14)",
        overflow: "hidden",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_event, nextValue: "login" | "register") =>
          router.replace(`/${locale}/${nextValue === "login" ? "login" : "signup"}`)
        }
        variant="fullWidth"
        sx={{
          p: 1,
          bgcolor: "rgba(90, 70, 166, 0.05)",
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab
          disableRipple
          value="login"
          label="Connexion"
          sx={{
            borderRadius: 999,
            minHeight: 44,
            fontWeight: 700,
            textTransform: "none",
            color: "text.secondary",
            "&.Mui-selected": {
              color: "#4C3A8F",
              bgcolor: "background.paper",
              boxShadow: "0 8px 20px rgba(76, 58, 143, 0.12)",
            },
          }}
        />
        <Tab
          disableRipple
          value="register"
          label="Inscription"
          sx={{
            borderRadius: 999,
            minHeight: 44,
            fontWeight: 700,
            textTransform: "none",
            color: "text.secondary",
            "&.Mui-selected": {
              color: "#4C3A8F",
              bgcolor: "background.paper",
              boxShadow: "0 8px 20px rgba(76, 58, 143, 0.12)",
            },
          }}
        />
      </Tabs>

      {activeTab === "login" ? (
        <LoginForm locale={locale} />
      ) : (
        <RegisterForm locale={locale} />
      )}
    </Paper>
  );
}
