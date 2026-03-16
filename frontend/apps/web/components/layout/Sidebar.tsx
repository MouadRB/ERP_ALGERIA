"use client";

import {
  Avatar,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import ListAltOutlined from "@mui/icons-material/ListAltOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const navItems = [
  { label: "Tableau de Bord", href: "/dashboard", icon: <DashboardRounded /> },
  { label: "Commandes (OMS)", href: "/oms", icon: <ShoppingBagOutlined /> },
  { label: "Inventaire", href: "/inventory", icon: <Inventory2Outlined /> },
  { label: "CRM", href: "/crm", icon: <PeopleAltOutlined /> },
  { label: "Produits (PIM)", href: "/pim", icon: <CategoryOutlined /> },
  { label: "Catalogue", href: "/catalogue", icon: <ListAltOutlined /> },
  { label: "Approvisionnement", href: "/procurement", icon: <LocalShippingOutlined /> },
  { label: "Rapports", href: "/rapports", icon: <BarChartOutlined /> },
  { label: "Parametres", href: "/parametres", icon: <SettingsOutlined /> }
];

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "fr";

  return (
    <Box
      sx={{
        width: 250,
        minWidth: 250,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        bgcolor: "#0F2742",
        color: "#DCE6F2",
        paddingX: 2,
        paddingY: 3
      }}
    >
      <Typography variant="caption" sx={{ letterSpacing: 1, opacity: 0.6, mb: 2 }}>
        NAVIGATION
      </Typography>

      <List sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);

          return (
            <ListItemButton
              key={item.label}
              component={Link}
              href={href}
              sx={{
                borderRadius: 2,
                gap: 1,
                color: isActive ? "#FFFFFF" : "#B7C5D6",
                backgroundColor: isActive ? "#1A4E8A" : "transparent",
                "&:hover": { backgroundColor: isActive ? "#1A4E8A" : "#16324E" }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  color: isActive ? "#FFFFFF" : "#8FA6BF"
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box mt="auto">
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 2 }} />
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#1A4E8A" }}>SA</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} color="#FFFFFF">
              Super Admin
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.6)">
              Connecte - Session active
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
