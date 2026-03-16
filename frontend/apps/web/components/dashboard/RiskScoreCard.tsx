"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

const segments = [
  { label: "Faible", value: 97, color: "#16A34A" },
  { label: "Moyen", value: 34, color: "#F59E0B" },
  { label: "Eleve", value: 11, color: "#EF4444" }
];

const total = segments.reduce((sum, item) => sum + item.value, 0);

function buildConicGradient() {
  let start = 0;
  const parts = segments.map((segment) => {
    const slice = (segment.value / total) * 100;
    const part = `${segment.color} ${start}% ${start + slice}%`;
    start += slice;
    return part;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

export default function RiskScoreCard() {
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
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        Score de Risque - Commandes du Jour
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2
        }}
      >
        <Box
          sx={{
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: buildConicGradient(),
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 1px #EEF2F7"
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              {total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              commandes
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack spacing={1}>
        {segments.map((segment) => (
          <Stack key={segment.label} direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: segment.color
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {segment.label}: {segment.value} commandes
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
