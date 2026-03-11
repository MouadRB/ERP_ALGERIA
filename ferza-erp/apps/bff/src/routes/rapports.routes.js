import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const rapportsRouter = Router();

rapportsRouter.get("/overview", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
