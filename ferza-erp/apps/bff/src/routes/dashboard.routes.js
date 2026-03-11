import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { config } from "../config/env.js";
import { getDashboardOverview } from "../services/dashboard.service.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (req, res) => {
  if (config.useMock) return res.json({ kpis: {}, charts: {} });
  const data = await getDashboardOverview({ token: req.user?.token });
  return res.json(data);
});
