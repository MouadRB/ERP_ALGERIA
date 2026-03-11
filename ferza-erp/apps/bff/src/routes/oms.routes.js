import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const omsRouter = Router();

omsRouter.get("/queue", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

omsRouter.get("/orders", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

omsRouter.get("/orders/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

omsRouter.post("/orders/:id/confirm", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

omsRouter.post("/orders/:id/cancel", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
