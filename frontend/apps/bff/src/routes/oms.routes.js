const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const orderService = require('../services/order.service');
const returnsService = require('../services/oms-returns.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();
const OMS_ROLES = ['OMS_OPERATOR', 'SUPERADMIN'];

const numberOptional = z.preprocess(
  (v) => (v === undefined || v === null || v === '' ? undefined : Number(v)),
  z.number().optional(),
);
const booleanOptional = z.preprocess(
  (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
  z.boolean().optional(),
);

const assignCarrierSchema = z.object({
  carrier: z.enum(['Yalidine', 'Maystro', 'Ecotrack', 'Procolis']),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'La raison doit contenir au moins 5 caracteres.'),
});

const createOrderSchema = z.object({
  nomComplet: z.string().min(2),
  telephone: z.string().min(5),
  adresse: z.string().min(3),
  wilayaCode: z.string().min(2),
  commune: z.string().min(2),
  source: z.string().optional(),
  noteInterne: z.string().optional(),
  items: z.array(
    z.object({
      sku: z.string().min(3),
      quantity: z.number().int().min(1).optional(),
      qty: z.number().int().min(1).optional(),
    }),
  ).optional(),
});

const returnActionSchema = z.object({
  action: z.enum(['reintegrate', 'resend', 'declare_loss']),
  items: z.array(
    z.object({
      sku: z.string().min(3),
      quantity: z.number().int().min(1).optional(),
      qty: z.number().int().min(1).optional(),
    }),
  ).optional(),
});

router.get(
  '/stats',
  requireRole(...OMS_ROLES, 'ANALYST'),
  async (_req, res, next) => {
    try {
      res.json({ data: await orderService.getStats() });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/queue',
  requireRole(...OMS_ROLES, 'ANALYST'),
  async (_req, res, next) => {
    try {
      res.json({ data: await orderService.getQueue() });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/suivi',
  requireRole('OMS_OPERATOR', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      res.json({ data: await orderService.getCarrierSuivi() });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/retours',
  requireRole('OMS_OPERATOR', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      res.json({ data: returnsService.getRetours() });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/analytics',
  requireRole('OMS_OPERATOR', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      res.json({ data: await orderService.getAnalytics(req.query.period || '7d') });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/',
  requireRole(...OMS_ROLES, 'ANALYST'),
  validateQuery(
    paginationSchema.extend({
      status: z.string().optional(),
      carrier: z.string().optional(),
      wilaya: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      codMin: numberOptional,
      codMax: numberOptional,
      riskLevel: z.string().optional(),
      source: z.string().optional(),
      attempts: numberOptional,
      hasCarrier: booleanOptional,
      sort: z.enum(['date_desc', 'montant', 'statut', 'wilaya']).optional(),
      customerId: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const result = await orderService.getOrders(req.validatedQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/',
  requireRole(...OMS_ROLES),
  validate(createOrderSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.createOrder(req.validated);
      res.status(201).json({ data: order });
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
  '/:id/return-action',
  requireRole(...OMS_ROLES),
  validate(returnActionSchema),
  async (req, res, next) => {
    try {
      const result = await orderService.handleReturnAction(
        req.params.id,
        req.validated.action,
        { items: req.validated.items },
      );
      if (!result) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: result });
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
      const order = await orderService.cancelOrder(
        req.params.id,
        req.validated.reason,
        req.user.id,
      );
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
      const order = await orderService.assignCarrier(
        req.params.id,
        req.validated.carrier,
        req.user.id,
      );
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
