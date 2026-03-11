import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const procurementRouter = Router();

procurementRouter.get("/bcs", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

procurementRouter.get("/bcs/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
