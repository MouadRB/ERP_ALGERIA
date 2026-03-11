import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

export const catalogueRouter = Router();

catalogueRouter.get("/", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

catalogueRouter.get("/:id", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

catalogueRouter.put("/:id/publish", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

catalogueRouter.put("/:id/unpublish", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

catalogueRouter.get("/opensearch/status", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});

catalogueRouter.post("/opensearch/reindex", requireAuth, async (req, res) => {
  res.status(501).json({ error: "Not implemented" });
});
