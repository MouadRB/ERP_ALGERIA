"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import FiberManualRecordRounded from "@mui/icons-material/FiberManualRecordRounded";

const FEATURE_LIST = [
  "Gestion multi-entrepots et suivi temps reel",
  "CRM integre avec pipeline commercial",
  "Approvisionnement et bons de commande",
  "Facturation et conformite fiscale DZ",
  "Tableau de bord analytique avance",
  "Securise et heberge en Algerie"
];

const TAGS = [
  "SuperAdmin",
  "Product Mgr",
  "Inventory",
  "CRM",
  "Procurement",
  "Warehouse"
];

export default function AuthLeftPanel() {
  return (
    <Box
      sx={{
        flex: "0 0 42%",
        position: "relative",
        color: "#F3EEFF",
        padding: { md: 6, lg: 8 },
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #4D3C8B 0%, #44357E 100%)",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 320,
          height: 320,
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
          gap: 3
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 26,
              backgroundColor: "rgba(255, 255, 255, 0.15)"
            }}
          >
            F
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} letterSpacing={3}>
              FERZA
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, marginTop: 0.5 }}>
              Systeme ERP E-Commerce Algerien
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1.6} sx={{ mt: 1 }}>
          {FEATURE_LIST.map((item) => (
            <Stack key={item} direction="row" spacing={1.5} alignItems="center">
              <FiberManualRecordRounded sx={{ fontSize: 10, color: "#B8A7FF" }} />
              <Typography variant="body2" sx={{ color: "#E5DEFF" }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                borderRadius: 2,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#E9E3FF",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            />
          ))}
        </Box>
        <Chip
          label="Architecture v2.0 - Heberge en Algerie"
          size="small"
          sx={{
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            color: "#E9E3FF"
          }}
        />
      </Box>
    </Box>
  );
}
