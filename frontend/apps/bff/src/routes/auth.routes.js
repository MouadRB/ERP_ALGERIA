const express = require("express");
const { z } = require("zod");
const authMock = require("../mocks/auth.mock");
const env = require("../config/env");
const { AppError } = require("../errors/AppError");
const { issueMockAuthToken } = require("../lib/auth");

const router = express.Router();

const ENGINE_B_ROLES = [
  "SuperAdmin",
  "ProductManager",
  "InventoryManager",
  "FinanceManager",
  "WarehouseOperator",
  "ProcurementManager",
  "CRMAgent",
  "LogisticsAgent",
  "ReportingAnalyst"
];

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
  tenantId: z.string().min(1, "L'identifiant entreprise est requis."),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis."),
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
  tenantId: z.string().min(1, "L'identifiant entreprise est requis."),
  inviteToken: z.string().optional(),
});

const findMockAccountByEmail = (email) =>
  authMock.accounts.find(
    (account) => account.email.toLowerCase() === email.trim().toLowerCase(),
  );

const parseBackendError = async (response, fallbackMessage) => {
  try {
    const payload = await response.json();

    if (typeof payload?.error === "string" && payload.error.trim()) {
      return payload.error;
    }

    if (typeof payload?.error?.message === "string" && payload.error.message.trim()) {
      return payload.error.message;
    }
  } catch {
    // Ignore non-JSON backend failures and fall back to the default message.
  }

  return fallbackMessage;
};

const proxyAuthRequest = async (path, body, fallbackMessage) => {
  try {
    const response = await fetch(`${env.engineBUrl}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await parseBackendError(response, fallbackMessage);
      throw new AppError(
        response.status === 401 ? "UNAUTHORIZED" : "AUTH_ERROR",
        message,
        response.status,
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      "AUTH_SERVICE_UNAVAILABLE",
      "Impossible de joindre le service d'authentification.",
      502,
    );
  }
};

router.get("/roles", (_req, res) => {
  res.json({
    data: env.authUseMock
      ? authMock.roles
      : ENGINE_B_ROLES.map((role) => ({ id: role, label: role })),
  });
});

router.get("/debug", (_req, res) => {
  res.json({
    data: {
      authUseMock: env.authUseMock,
      roles: env.authUseMock
        ? authMock.roles
        : ENGINE_B_ROLES.map((role) => ({ id: role, label: role })),
      accounts: env.authUseMock
        ? authMock.accounts.map((account) => ({
            id: account.id,
            fullName: account.fullName,
            email: account.email,
            rawRole: account.rawRole,
          }))
        : [],
      engineBUrl: env.engineBUrl,
    },
  });
});

router.post("/register", async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body ?? {});

    if (env.authUseMock) {
      if (findMockAccountByEmail(payload.email)) {
        throw new AppError(
          "AUTH_ERROR",
          "A user with this email already exists.",
          400,
        );
      }

      const account = {
        id: `usr_${Date.now()}`,
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        rawRole: "User",
      };

      authMock.accounts.push(account);

      res.json({
        data: await issueMockAuthToken(account),
      });
      return;
    }

    const response = await proxyAuthRequest(
      "register",
      {
        Email: payload.email.trim(),
        Password: payload.password,
        FullName: payload.fullName.trim(),
        TenantId: payload.tenantId.trim(),
        InviteToken: payload.inviteToken?.trim() || null,
      },
      "L'inscription a echoue.",
    );

    res.json({ data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      next(new AppError("VALIDATION_ERROR", issue?.message ?? "Validation invalide.", 400));
      return;
    }

    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body ?? {});

    if (env.authUseMock) {
      const account = findMockAccountByEmail(payload.email);

      if (!account || account.password !== payload.password) {
        throw new AppError("UNAUTHORIZED", "Invalid email or password.", 401);
      }

      res.json({
        data: await issueMockAuthToken(account),
      });
      return;
    }

    const response = await proxyAuthRequest(
      "login",
      {
        Email: payload.email.trim(),
        Password: payload.password,
        TenantId: payload.tenantId.trim(),
      },
      "Echec de la connexion.",
    );

    res.json({ data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      next(new AppError("VALIDATION_ERROR", issue?.message ?? "Validation invalide.", 400));
      return;
    }

    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.status(204).send();
});

module.exports = router;
