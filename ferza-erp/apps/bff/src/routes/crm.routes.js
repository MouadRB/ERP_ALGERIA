import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const crmRouter = Router();

crmRouter.get("/customers", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

crmRouter.get("/customers/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

crmRouter.get("/customers/:id/risk", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
