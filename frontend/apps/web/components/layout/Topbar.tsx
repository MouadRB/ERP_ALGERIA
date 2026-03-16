"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";

type UserInfo = {
  name: string;
  roleLabel: string;
};

export default function Topbar() {
  const [user, setUser] = useState<UserInfo>({
    name: "SuperAdmin",
    roleLabel: "Administrateur"
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("ferza.mock.user");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { name?: string; label?: string };
      setUser({
        name: parsed?.name ?? "SuperAdmin",
        roleLabel: parsed?.label ?? "Administrateur"
      });
    } catch {
      // ignore parsing errors
    }
  }, []);

  const initials = useMemo(() => {
    const parts = user.name.split(" ").filter(Boolean);
    if (parts.length === 0) return "SA";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [user.name]);

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E6EDF5",
        paddingX: { xs: 2, md: 3 },
        paddingY: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#1A4E8A", width: 34, height: 34 }}>F</Avatar>
        <Typography variant="subtitle1" fontWeight={700} color="#1A4E8A">
          FERZA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tableau de Bord
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 6,
          backgroundColor: "#F3F6FB",
          paddingX: 1,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          minWidth: 280
        }}
      >
        <TextField
          variant="standard"
          placeholder="Rechercher..."
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ color: "#90A4BF" }} />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
      </Paper>

      <IconButton>
        <Badge color="error" variant="dot" overlap="circular">
          <NotificationsNoneRounded sx={{ color: "#6B7A90" }} />
        </Badge>
      </IconButton>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ bgcolor: "#1A4E8A", width: 36, height: 36 }}>{initials}</Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600} color="#1B2B3D">
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.roleLabel}
          </Typography>
        </Box>
        <KeyboardArrowDownRounded sx={{ color: "#90A4BF" }} />
      </Box>
    </Box>
  );
}
