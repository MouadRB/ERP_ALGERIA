"use client";

import { Box, Drawer, Typography } from "@mui/material";

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationPanel({
  open,
  onClose
}: NotificationPanelProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={320} padding={2}>
        <Typography variant="h6">Notifications</Typography>
        <Typography variant="body2" color="text.secondary">
          No notifications yet.
        </Typography>
      </Box>
    </Drawer>
  );
}
