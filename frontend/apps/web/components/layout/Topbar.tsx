"use client";

import { useMemo } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import Tooltip from "@mui/material/Tooltip";
import { useParams, useRouter } from "next/navigation";
import { useColorMode } from "@/providers/ThemeRegistry";
import { useSession } from "@/providers/SessionProvider";

export default function Topbar() {
  const { mode, toggleMode } = useColorMode();
  const router = useRouter();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "fr";
  const { session, signOut } = useSession();

  const userName = session?.nameFr?.trim() || session?.email?.trim() || "Utilisateur";
  const userRoleLabel = session?.roleLabel || "Role non attribue";

  const initials = useMemo(() => {
    const parts = userName.split(" ").filter(Boolean);
    if (parts.length === 0) return "SA";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [userName]);

  const handleLogout = () => {
    signOut();
    router.replace(`/${locale}/login`);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        paddingX: { xs: 2, md: 3 },
        paddingY: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 2
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34 }}>F</Avatar>
        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
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
          bgcolor: "action.hover",
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
                <SearchRounded sx={{ color: "text.secondary" }} />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
      </Paper>

      <Tooltip title={mode === "light" ? "Mode sombre" : "Mode clair"}>
        <IconButton onClick={toggleMode} aria-label="toggle color mode">
          {mode === "light" ? (
            <DarkModeRounded sx={{ color: "text.secondary" }} />
          ) : (
            <LightModeRounded sx={{ color: 'warning.main' }} />
          )}
        </IconButton>
      </Tooltip>

      <IconButton>
        <Badge color="error" variant="dot" overlap="circular">
          <NotificationsNoneRounded sx={{ color: "text.secondary" }} />
        </Badge>
      </IconButton>

      <Tooltip title="Se deconnecter">
        <Button
          onClick={handleLogout}
          startIcon={<LogoutRounded />}
          variant="text"
          sx={{
            textTransform: "none",
            color: "text.secondary",
            minWidth: "auto",
            px: 1,
          }}
        >
          Deconnexion
        </Button>
      </Tooltip>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>{initials}</Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userRoleLabel}
          </Typography>
        </Box>
        <KeyboardArrowDownRounded sx={{ color: "text.secondary" }} />
      </Box>
    </Box>
  );
}
