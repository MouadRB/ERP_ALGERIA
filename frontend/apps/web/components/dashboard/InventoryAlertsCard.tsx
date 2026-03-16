"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";

const alerts = [
  {
    level: "RUPTURE",
    levelColor: "#EF4444",
    levelBg: "#FEE2E2",
    product: "Samsung Galaxy A54 Coque Noire",
    details: "0 unites - Alger Entrepot"
  },
  {
    level: "CRITIQUE",
    levelColor: "#F97316",
    levelBg: "#FFEDD5",
    product: "Nike Air Max 90 - Taille 42",
    details: "3 unites - Seuil: 10"
  },
  {
    level: "CRITIQUE",
    levelColor: "#F97316",
    levelBg: "#FFEDD5",
    product: "Xiaomi Redmi Note 12 - 128GB",
    details: "5 unites - Seuil: 15"
  },
  {
    level: "FAIBLE",
    levelColor: "#F59E0B",
    levelBg: "#FEF3C7",
    product: "Adidas Ultraboost 22 - Taille 40",
    details: "8 unites - Seuil: 20"
  },
  {
    level: "FAIBLE",
    levelColor: "#F59E0B",
    levelBg: "#FEF3C7",
    product: "Apple AirPods Pro 2eme Gen",
    details: "12 unites - Seuil: 25"
  }
];

export default function InventoryAlertsCard() {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: "1px solid #E6EDF5",
        backgroundColor: "#FFFFFF",
        p: 2.5
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={700}>
          Alertes Inventaire
        </Typography>
        <Box
          sx={{
            bgcolor: "#FEE2E2",
            color: "#EF4444",
            px: 1,
            py: 0.3,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700
          }}
        >
          7 critiques
        </Box>
      </Stack>

      <Stack spacing={2}>
        {alerts.map((item, index) => (
          <Stack key={index} direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                minWidth: 72,
                textAlign: "center",
                bgcolor: item.levelBg,
                color: item.levelColor,
                fontWeight: 700,
                fontSize: 11,
                px: 1,
                py: 0.4,
                borderRadius: 999
              }}
            >
              {item.level}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {item.product}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.details}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#1A4E8A",
                textTransform: "none",
                "&:hover": { bgcolor: "#143B68" }
              }}
            >
              Reapprovisionner
            </Button>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
