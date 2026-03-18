const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const inventoryService = require('../services/inventory.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();

router.get(
  '/',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const result = await inventoryService.getStock(req.validatedQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:sku',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const item = await inventoryService.getStockBySKU(req.params.sku);
      if (!item) return next(new AppError('NOT_FOUND', 'SKU introuvable.', 404));
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;