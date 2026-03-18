const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const orderService = require('../services/order.service');
const { AppError } = require('../errors/AppError');
const { z } = require('zod');

const router = express.Router();

const OMS_ROLES = ['OMS_OPERATOR', 'SUPERADMIN'];

const assignCarrierSchema = z.object({
  carrier: z.enum(['Yalidine', 'Maystro', 'Ecotrack', 'Procolis']),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caractères.'),
});

router.get(
  '/',
  requireRole(...OMS_ROLES, 'ANALYST'),
  validateQuery(paginationSchema.extend({ status: z.string().optional() })),
  async (req, res, next) => {
    try {
      const result = await orderService.getOrders(req.validatedQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  requireRole(...OMS_ROLES, 'ANALYST'),
  async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/confirm',
  requireRole(...OMS_ROLES),
  async (req, res, next) => {
    try {
      const order = await orderService.confirmOrder(req.params.id, req.user.id);
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/cancel',
  requireRole(...OMS_ROLES),
  validate(cancelOrderSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.validated.reason, req.user.id);
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/assign-carrier',
  requireRole(...OMS_ROLES),
  validate(assignCarrierSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.assignCarrier(req.params.id, req.validated.carrier, req.user.id);
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;