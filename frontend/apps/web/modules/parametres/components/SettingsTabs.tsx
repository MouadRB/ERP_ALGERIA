"use client";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import type { ElementType } from "react";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import PublicRounded from "@mui/icons-material/PublicRounded";
import NotificationsNoneRounded from "@mui/icons-material/NotificationsNoneRounded";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import type { SettingsTabId } from "../types";

interface TabItem {
  id: SettingsTabId;
  label: string;
  icon: ElementType;
}

interface TabGroup {
  title: string;
  items: TabItem[];
}

const tabGroups: TabGroup[] = [
  {
    title: "GÉNÉRAL",
    items: [
      { id: "informations-societe", label: "Informations Société", icon: SettingsRounded },
      { id: "regional-langue", label: "Régional & Langue", icon: PublicRounded },
      { id: "notifications", label: "Notifications & Alertes", icon: NotificationsNoneRounded }
    ]
  },
  {
    title: "OPÉRATIONS",
    items: [
      { id: "gestion-commandes", label: "Gestion des Commandes (OMS)", icon: ShoppingBagOutlined },
      { id: "livraison-wilayas", label: "Livraison & Wilayas", icon: LocalShippingOutlined },
      { id: "inventaire-stock", label: "Inventaire & Stock", icon: Inventory2Outlined },
      { id: "crm-clients", label: "CRM & Clients", icon: PeopleAltOutlined }
    ]
  },
  {
    title: "SÉCURITÉ",
    items: [
      { id: "utilisateurs-roles", label: "Utilisateurs & Rôles", icon: AccountCircleOutlined },
      { id: "securite-acces", label: "Sécurité & Accès", icon: LockOutlined }
    ]
  }
];

type SettingsTabsProps = {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
};

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <Box sx={{ width: { xs: "100%", md: 260 }, flexShrink: 0 }}>
      {tabGroups.map((group) => (
        <Box key={group.title} sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: 1,
              color: "#94A3B8",
              display: "block",
              px: 1,
              mb: 1
            }}
          >
            {group.title}
          </Typography>
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {group.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <ListItemButton
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    gap: 1.5,
                    alignItems: "center",
                    justifyContent: "flex-start",
                    borderLeft: isActive ? "3px solid #2563EB" : "3px solid transparent",
                    backgroundColor: isActive ? "#EEF4FF" : "transparent",
                    color: isActive ? "#1D4ED8" : "#5B6B7C",
                    "&:hover": {
                      backgroundColor: isActive ? "#EEF4FF" : "#F4F7FB"
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: isActive ? "#1D4ED8" : "#94A3B8"
                    }}
                  >
                    <item.icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}
