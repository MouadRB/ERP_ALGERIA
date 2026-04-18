const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const inventoryService = require('../services/inventory.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();

router.get(
  '/',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(
    paginationSchema.extend({
      stockStatus: z.string().optional(),
      categoryId: z.string().optional(),
      sort: z.string().optional(),
    }),
  ),
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
  '/stats',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      const stats = await inventoryService.getStats();
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/alerts',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      const alerts = await inventoryService.getAlerts();
      res.json({ data: alerts });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/movements',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(
    z.object({
      sku: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const rows = await inventoryService.getMovements(req.validatedQuery);
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:sku/fifo',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const layers = await inventoryService.getFifoLayers(req.params.sku);
      res.json({ data: layers });
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

router.post(
  '/movements',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      sku: z.string().min(1),
      type: z.enum(['receipt', 'sale', 'return', 'quarantine', 'physicalInventory']),
      quantity: z.number(),
      reason: z.string().optional(),
      unitCostHT: z.number().optional(),
      referenceId: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const item = await inventoryService.createMovement(req.validated);
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/quarantine',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      sku: z.string().min(1),
      quantity: z.number().positive(),
      reason: z.string().min(2),
    }),
  ),
  async (req, res, next) => {
    try {
      const item = await inventoryService.quarantineStock(req.validated);
      if (!item) return next(new AppError('NOT_FOUND', 'SKU introuvable.', 404));
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/returns/decision',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      sku: z.string().min(1),
      returnId: z.string().min(1),
      decision: z.enum(['approve', 'reject']),
    }),
  ),
  async (req, res, next) => {
    try {
      const item = await inventoryService.processReturn(req.validated);
      if (!item) return next(new AppError('NOT_FOUND', 'Retour introuvable.', 404));
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
