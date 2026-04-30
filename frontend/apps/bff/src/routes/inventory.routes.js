// ─────────────────────────────────────────────────────────────────────────────
// Inventory routes — orchestrator on top of Engine-A.
//
// Every handler delegates to inventory.service which calls Engine-A through
// engine-a.client. The frontend NEVER sees Engine-A directly. Mock paths are
// gone — the service layer is the only orchestration point.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const inventoryService = require('../services/inventory.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();

// Build the per-request context the service forwards to Engine-A.
const buildCtx = (req) => ({ req });

// ─── Stock list ─────────────────────────────────────────────────────────────

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
      const result = await inventoryService.getStock(req.validatedQuery, buildCtx(req));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// ─── Dashboard ──────────────────────────────────────────────────────────────

router.get(
  '/stats',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const stats = await inventoryService.getStats(buildCtx(req));
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Alerts ─────────────────────────────────────────────────────────────────

router.get(
  '/alerts',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const alerts = await inventoryService.getAlerts(buildCtx(req));
      res.json({ data: alerts });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/alerts/reorder',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST', 'PROCUREMENT_MANAGER'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.getReorderSuggestions(buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/alerts/:id/resolve',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.resolveAlert(req.params.id, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Movements ──────────────────────────────────────────────────────────────

router.get(
  '/movements',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(
    z.object({
      sku: z.string().optional(),
      page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
      pageSize: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50)),
    }),
  ),
  async (req, res, next) => {
    try {
      const rows = await inventoryService.getMovements(req.validatedQuery, buildCtx(req));
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/movements/audit',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(
    z.object({
      type: z.string().optional(),
      page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
      pageSize: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50)),
    }),
  ),
  async (req, res, next) => {
    try {
      const result = await inventoryService.getAuditJournal(req.validatedQuery, buildCtx(req));
      res.json(result);
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
      type: z.enum(['receipt', 'sale', 'return', 'quarantine', 'physicalInventory', 'adjustment']),
      quantity: z.number(),
      reason: z.string().optional(),
      unitCostHT: z.number().optional(),
      referenceId: z.string().optional(),
      purchaseOrderRef: z.string().optional(),
      supplierCode: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const item = await inventoryService.createMovement(req.validated, buildCtx(req));
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/movements/bulk',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      stockRecordIds: z.array(z.string().min(1)).nonempty(),
      movementType: z.enum(['RECEPTION', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT']),
      quantity: z.number().int().positive(),
      purchaseOrderRef: z.string().optional(),
      supplierCode: z.string().optional(),
      unitCost: z.number().optional(),
      reason: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const result = await inventoryService.bulkMovement(req.validated, buildCtx(req));
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Quarantine (no native endpoint — adjust with reason=QUARANTINE) ────────

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
      const item = await inventoryService.quarantineStock(req.validated, buildCtx(req));
      if (!item) return next(new AppError('NOT_FOUND', 'SKU introuvable.', 404));
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Reservations (OMS sync) ────────────────────────────────────────────────

router.post(
  '/reservations/soft',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'OMS_OPERATOR'),
  validate(
    z.object({
      sku: z.string().min(1),
      orderId: z.string().min(1),
      clientRef: z.string().optional(),
      quantity: z.number().int().positive(),
      omsStatus: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const data = await inventoryService.createSoftReservation(req.validated, buildCtx(req));
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/reservations/:id/upgrade',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'OMS_OPERATOR'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.upgradeReservation(req.params.id, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/reservations/:id/release',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'OMS_OPERATOR'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.releaseReservation(req.params.id, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/reservations/ship/:orderId',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.shipOrder(req.params.orderId, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/reservations/order/:orderId',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST', 'OMS_OPERATOR', 'CRM_AGENT'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.getReservationsByOrder(req.params.orderId, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/reservations/stock/:id',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.getReservationsByStockRecord(
        req.params.id,
        buildCtx(req),
      );
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Returns ────────────────────────────────────────────────────────────────

router.post(
  '/returns',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      sku: z.string().min(1),
      orderId: z.string().min(1),
      customerRef: z.string().optional(),
      returnReason: z.string().min(1),
      productCondition: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ),
  async (req, res, next) => {
    try {
      const data = await inventoryService.createReturn(req.validated, buildCtx(req));
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/returns/:id/approve',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.approveReturn(req.params.id, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/returns/:id/reject',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      rejectionReason: z.string().optional(),
      disposition: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const data = await inventoryService.rejectReturn(
        req.params.id,
        req.validated,
        buildCtx(req),
      );
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/returns',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(
    paginationSchema.extend({
      status: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const result = await inventoryService.listReturns(req.validatedQuery, buildCtx(req));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/returns/:id',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.getReturnById(req.params.id, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

// Frontend convenience: legacy "decision" endpoint (approve / reject in one).
router.post(
  '/returns/decision',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      returnId: z.string().min(1),
      decision: z.enum(['approve', 'reject']),
      rejectionReason: z.string().optional(),
      disposition: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const item = await inventoryService.processReturn(req.validated, buildCtx(req));
      if (!item) return next(new AppError('NOT_FOUND', 'Retour introuvable.', 404));
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Stock detail / FIFO / evolution (SKU-keyed) ────────────────────────────
//
// These come AFTER the static "alerts/movements/returns/reservations" routes
// because they take a free-form SKU param. Without ordering they would shadow
// the named ones (e.g. /alerts would match /:sku).

router.get(
  '/:sku/fifo',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.getFifoLayers(req.params.sku, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:sku/evolution',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const data = await inventoryService.getStockEvolution(req.params.sku, buildCtx(req));
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:sku/threshold',
  requireRole('INVENTORY_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      reorderThreshold: z.number().int().min(0),
      reorderQuantity: z.number().int().min(1),
    }),
  ),
  async (req, res, next) => {
    try {
      const data = await inventoryService.updateThreshold(
        req.params.sku,
        req.validated,
        buildCtx(req),
      );
      res.json({ data });
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
      const item = await inventoryService.getStockBySKU(req.params.sku, buildCtx(req));
      if (!item) return next(new AppError('NOT_FOUND', 'SKU introuvable.', 404));
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
