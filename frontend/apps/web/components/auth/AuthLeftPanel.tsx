"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import FiberManualRecordRounded from "@mui/icons-material/FiberManualRecordRounded";

const FEATURE_LIST = [
  "Gestion multi-entrepots",
  "CRM clients et tickets",
  "Approvisionnement intelligent",
  "Finance et facturation",
  "Dashboard analytique",
  "Controle d'acces multi-role",
  "OAuth Google pret",
  "Hebergement en Algerie"
];

const TAGS = [
  "SuperAdmin",
  "ProductManager",
  "InventoryManager",
  "FinanceManager",
  "ProcurementManager",
  "CRMAgent"
];

export default function AuthLeftPanel() {
  return (
    <Box
      sx={{
        width: { xs: "100%", md: "45%" },
        position: "relative",
        color: "#F3EEFF",
        padding: { xs: 4, md: 6, lg: 8 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: { xs: 240, md: "100vh" },
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,0.2), transparent 28%), linear-gradient(180deg, #4C3A8F 0%, #5A46A6 100%)",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: { xs: 220, md: 320 },
          height: { xs: 220, md: 320 },
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          top: -120,
          left: -120
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.06)",
          bottom: -100,
          right: -60
        }
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight={900}
            letterSpacing={-1}
            sx={{ fontSize: { xs: 34, md: 42 } }}
          >
            FERZA
          </Typography>
          <Typography
            variant="body2"
            sx={{ opacity: 0.86, marginTop: 0.75, letterSpacing: 1.1 }}
          >
            Systeme ERP E-Commerce Algerien
          </Typography>
        </Box>

        <Stack spacing={1.8} sx={{ mt: 1, display: { xs: "none", md: "flex" } }}>
          {FEATURE_LIST.map((item) => (
            <Stack key={item} direction="row" spacing={1.5} alignItems="flex-start">
              <FiberManualRecordRounded sx={{ fontSize: 10, color: "#D8CFFF", mt: 0.7 }} />
              <Typography variant="body2" sx={{ color: "#EDE7FF", lineHeight: 1.7 }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, display: { xs: "none", md: "block" } }}>
        <Typography
          variant="caption"
          sx={{ display: "block", opacity: 0.78, mb: 1.5, letterSpacing: 1.3 }}
        >
          ROLES DISPONIBLES
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                borderRadius: 999,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#E9E3FF",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            />
          ))}
          <Chip
            label="+3 roles"
            size="small"
            sx={{
              borderRadius: 999,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "rgba(233, 227, 255, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
