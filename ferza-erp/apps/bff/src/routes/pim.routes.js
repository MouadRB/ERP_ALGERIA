import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const pimRouter = Router();

pimRouter.get("/products", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

pimRouter.get("/products/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
