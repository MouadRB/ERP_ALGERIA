const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { AppError } = require('../errors/AppError');
const env = require('../config/env');

const router = express.Router();

router.get('/', requireRole('SUPERADMIN'), async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new AppError('FORBIDDEN', 'Tenant non identifié dans le token. Reconnectez-vous.', 403);
    }

    const authHeader = req.headers.authorization;
    const response = await fetch(
      `${env.engineBUrl}/api/tenants/${encodeURIComponent(tenantId)}/users`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      },
    );

    if (!response.ok) {
      throw new AppError('USERS_ERROR', 'Erreur lors du chargement des utilisateurs.', response.status);
    }

    const data = await response.json();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
