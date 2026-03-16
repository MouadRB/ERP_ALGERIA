import { Box, Button, Paper, Typography } from "@mui/material";
import Link from "next/link";

export default function SignupPage({
  params
}: {
  params: { locale: "fr" | "ar" };
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F6FA",
        padding: 3
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 480,
          width: "100%",
          borderRadius: 3,
          padding: 4,
          textAlign: "center"
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Inscription
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          La page d&apos;inscription arrive bientot.
        </Typography>
        <Button
          component={Link}
          href={`/${params.locale}/login`}
          variant="contained"
          sx={{
            backgroundColor: "#4D3C8B",
            borderRadius: 2,
            paddingX: 3,
            "&:hover": { backgroundColor: "#43337A" }
          }}
        >
          Retour a la connexion
        </Button>
      </Paper>
    </Box>
  );
}
