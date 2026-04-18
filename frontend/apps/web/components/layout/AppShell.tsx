"use client";

import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="background.default"
      color="text.primary"
    >
      <Topbar />
      <Box display="flex" flexGrow={1} minHeight={0}>
        <Sidebar />
        <Box
          component="main"
          flexGrow={1}
          minWidth={0}
          padding={{ xs: 2, md: 3 }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
