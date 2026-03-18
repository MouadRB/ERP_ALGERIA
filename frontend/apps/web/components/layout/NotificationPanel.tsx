'use client';

import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchBFF } from '@/lib/fetchBFF';
import type { ApiResponse } from '@ferza/shared';

interface Notification {
  id: string;
  type: string;
  titleFr: string;
  titleAr: string;
  bodyFr: string;
  bodyAr: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
}

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationPanel({
  open,
  onClose,
}: NotificationPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      fetchBFF<ApiResponse<Notification[]>>('/bff/notifications'),
    enabled: open,
  });

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={340} role="presentation">
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 15 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={unreadCount}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
        </Box>

        <Divider />

        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={120}
          >
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ px: 2.5, py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Aucune notification.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notif, index) => (
              <Box key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    backgroundColor: notif.read
                      ? 'transparent'
                      : 'primary.50',
                    opacity: notif.read ? 0.75 : 1,
                  }}
                >
                  <ListItemText
                    primary={notif.titleFr}
                    secondary={notif.bodyFr}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: notif.read ? 400 : 600,
                    }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
}