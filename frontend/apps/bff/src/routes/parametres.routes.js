const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const parametresService = require('../services/parametres.service');

const router = express.Router();

router.get(
  '/',
  requireRole('SUPERADMIN'),
  async (_req, res, next) => {
    try {
      const data = await parametresService.getSettings();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/',
  requireRole('SUPERADMIN'),
  async (req, res, next) => {
    try {
      const data = await parametresService.updateSettings(req.body ?? {});
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
