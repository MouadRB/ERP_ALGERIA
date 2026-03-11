import { Router } from "express";
import { config } from "../config/env.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getNotificationsMock } from "../mocks/notifications.mock.js";
import { getNotifications } from "../services/notifications.service.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req, res) => {
  if (config.useMock) return res.json(getNotificationsMock());
  const data = await getNotifications({ token: req.user?.token });
  return res.json(data);
});

