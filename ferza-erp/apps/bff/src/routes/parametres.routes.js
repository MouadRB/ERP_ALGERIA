import { Router } from "express";
import { config } from "../config/env.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/rbac.middleware.js";
import { getParametresMock } from "../mocks/parametres.mock.js";
import { getParametres } from "../services/parametres.service.js";

export const parametresRouter = Router();

parametresRouter.get("/", requireAuth, requireRoles("SUPERADMIN"), async (req, res) => {
  if (config.useMock) return res.json(getParametresMock());
  const data = await getParametres({ token: req.user?.token });
  return res.json(data);
});

