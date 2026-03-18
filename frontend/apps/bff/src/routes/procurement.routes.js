const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { sodCheck } = require('../middleware/sod.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const procurementService = require('../services/procurement.service');
const { AppError } = require('../errors/AppError');
const { z } = require('zod');

const router = express.Router();

const rejectSchema = z.object({
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères.'),
});

/**
 * Middleware that fetches the BC and attaches it to req.bc.
 * Required before sodCheck so SoD has access to bc.createdBy.
 */
const fetchBCMiddleware = async (req, _res, next) => {
  try {
    const bc = await procurementService.getBCById(req.params.id);
    if (!bc) return next(new AppError('NOT_FOUND', 'Bon de commande introuvable.', 404));
    req.bc = bc;
    next();
  } catch (err) {
    next(err);
  }
};

router.get(
  '/',
  requireRole('PROCUREMENT_MANAGER', 'FINANCE_DIRECTOR', 'SUPERADMIN', 'ANALYST'),
  validateQuery(paginationSchema.extend({ status: z.string().optional() })),
  async (req, res, next) => {
    try {
      const result = await procurementService.getBCs(req.validatedQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  requireRole('PROCUREMENT_MANAGER', 'FINANCE_DIRECTOR', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const bc = await procurementService.getBCById(req.params.id);
      if (!bc) return next(new AppError('NOT_FOUND', 'Bon de commande introuvable.', 404));
      res.json({ data: bc });
    } catch (err) {
      next(err);
    }
  },
);

// BC approval — SUPERADMIN + FINANCE_DIRECTOR only + SoD enforced
router.patch(
  '/:id/approve',
  requireRole('SUPERADMIN', 'FINANCE_DIRECTOR'),
  fetchBCMiddleware,
  sodCheck,
  async (req, res, next) => {
    try {
      const bc = await procurementService.approveBC(req.params.id, req.user.id);
      res.json({ data: bc });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/reject',
  requireRole('SUPERADMIN', 'FINANCE_DIRECTOR'),
  validate(rejectSchema),
  async (req, res, next) => {
    try {
      const bc = await procurementService.rejectBC(req.params.id, req.user.id, req.validated.reason);
      if (!bc) return next(new AppError('NOT_FOUND', 'Bon de commande introuvable.', 404));
      res.json({ data: bc });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;