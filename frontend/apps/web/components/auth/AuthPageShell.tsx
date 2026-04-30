import { Box } from "@mui/material";
import AuthLeftPanel from "@/components/auth/AuthLeftPanel";

type AuthPageShellProps = {
  children: React.ReactNode;
};

export default function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        background: "linear-gradient(180deg, #F3F4F8 0%, #F7F5FC 100%)",
      }}
    >
      <AuthLeftPanel />

      <Box
        sx={{
          width: { xs: "100%", md: "55%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: 3, md: 5, lg: 7 },
          background:
            "radial-gradient(circle at top, rgba(90, 70, 166, 0.08), transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,242,255,0.6))",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
