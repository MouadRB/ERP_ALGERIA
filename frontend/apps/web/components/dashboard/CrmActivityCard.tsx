"use client";

import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import StarOutline from "@mui/icons-material/StarOutline";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";

const activities = [
  {
    icon: <PersonOffOutlined />,
    color: "#FEE2E2",
    iconColor: "#EF4444",
    text: "+213 0770 987 654",
    sub: "3eme absence enregistree - Risque MOYEN",
    time: "il y a 2 min"
  },
  {
    icon: <CheckCircleOutline />,
    color: "#DCFCE7",
    iconColor: "#16A34A",
    text: "+213 0550 456 123",
    sub: "Livraison reussie - Fidele confirme",
    time: "il y a 8 min"
  },
  {
    icon: <ErrorOutline />,
    color: "#FFE4E6",
    iconColor: "#F43F5E",
    text: "+213 0661 222 333",
    sub: "Blacklisté automatiquement - 5 absences",
    time: "il y a 15 min"
  },
  {
    icon: <StarOutline />,
    color: "#E0F2FE",
    iconColor: "#0EA5E9",
    text: "+213 0550 789 000",
    sub: "Segment change: A Risque - Champion",
    time: "il y a 32 min"
  },
  {
    icon: <AccessTimeOutlined />,
    color: "#FEF3C7",
    iconColor: "#F59E0B",
    text: "+213 0770 333 444",
    sub: "OTP envoye - Attente confirmation commande",
    time: "il y a 45 min"
  }
];

export default function CrmActivityCard() {
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
          Activite CRM
        </Typography>
        <Box
          sx={{
            bgcolor: "#DCFCE7",
            color: "#16A34A",
            px: 1,
            py: 0.3,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700
          }}
        >
          Temps reel
        </Box>
      </Stack>

      <Stack spacing={2}>
        {activities.map((item, index) => (
          <Stack key={index} direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: item.color, color: item.iconColor, width: 34, height: 34 }}>
              {item.icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {item.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.sub}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {item.time}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
