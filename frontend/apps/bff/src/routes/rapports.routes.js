const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const rapportsMock = require('../mocks/rapports.mock');

const router = express.Router();

router.get(
  '/',
  requireRole('ANALYST', 'SUPERADMIN', 'FINANCE_DIRECTOR'),
  async (_req, res, next) => {
    try {
      res.json({ data: rapportsMock });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;