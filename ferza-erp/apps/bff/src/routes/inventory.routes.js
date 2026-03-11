import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const inventoryRouter = Router();

inventoryRouter.get("/stock", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

inventoryRouter.get("/stock/:sku", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

inventoryRouter.get("/alerts", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

inventoryRouter.get("/fifo-costs", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
