const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { AppError } = require('../errors/AppError');
const env = require('../config/env');

const router = express.Router();

const ASSIGNABLE_ROLES = [
  'ProductManager',
  'InventoryManager',
  'FinanceManager',
  'WarehouseOperator',
  'ProcurementManager',
  'CRMAgent',
  'LogisticsAgent',
  'ReportingAnalyst',
];

const inviteSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  roles: z.array(z.string().min(1)).min(1, 'Au moins un rôle est requis.'),
});

router.get('/roles', requireRole('SUPERADMIN'), (_req, res) => {
  res.json({ data: ASSIGNABLE_ROLES.map((role) => ({ id: role, label: role })) });
});

router.post(
  '/',
  requireRole('SUPERADMIN'),
  async (req, res, next) => {
    try {
      const payload = inviteSchema.parse(req.body ?? {});

      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new AppError('FORBIDDEN', 'Tenant non identifié dans le token. Reconnectez-vous.', 403);
      }

      const authHeader = req.headers.authorization;
      const response = await fetch(
        `${env.engineBUrl}/api/tenants/${encodeURIComponent(tenantId)}/invites`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({ Email: payload.email, Roles: payload.roles }),
        },
      );

      if (!response.ok) {
        let errorMessage = "Erreur lors de l'envoi de l'invitation.";
        try {
          const body = await response.json();
          if (typeof body?.error === 'string' && body.error.trim()) {
            errorMessage = body.error;
          }
        } catch {
          // ignore parse error, use fallback message
        }
        throw new AppError('INVITE_ERROR', errorMessage, response.status);
      }

      const data = await response.json();
      res.json({ data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issue = error.issues[0];
        next(new AppError('VALIDATION_ERROR', issue?.message ?? 'Validation invalide.', 400));
        return;
      }
      next(error);
    }
  },
);

module.exports = router;
