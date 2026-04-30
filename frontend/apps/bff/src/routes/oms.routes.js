// ─────────────────────────────────────────────────────────────────────────────
// OMS routes — orchestrator on top of Engine-A.
//
// The frontend speaks to /bff/oms/* exclusively. Every handler delegates to
// order.service which calls Engine-A through engine-a.client. There are no
// mocks here — the service layer is the only orchestration point.
//
// Note on verbs: the frontend continues to issue PATCH for state mutations
// (confirm / cancel / deliver / assign-carrier / return-action). Inside the
// service layer those PATCHes are translated to Engine-A POSTs as required by
// the OMS contract (POST /oms/v1/orders/{id}/confirm, etc.).
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const orderService = require('../services/order.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();
const OMS_ROLES = ['OMS_OPERATOR', 'SUPERADMIN'];

const buildCtx = (req) => ({ req });

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
  reasonCode: z.string().optional(),
  reasonMessage: z.string().optional(),
});

const createOrderSchema = z.object({
  nomComplet: z.string().min(2),
  telephone: z.string().min(5),
  adresse: z.string().min(3),
  wilayaCode: z.string().min(2),
  commune: z.string().min(2),
  source: z.string().optional(),
  noteInterne: z.string().optional(),
  paymentMethod: z.string().optional(),
  customerId: z.string().optional(),
  items: z
    .array(
      z.object({
        sku: z.string().min(3),
        quantity: z.number().int().min(1).optional(),
        qty: z.number().int().min(1).optional(),
        unitPrice: z.number().optional(),
      }),
    )
    .optional(),
});

const returnActionSchema = z.object({
  action: z.enum(['reintegrate', 'resend', 'declare_loss']),
  returnId: z.string().optional(),
  items: z
    .array(
      z.object({
        sku: z.string().min(3),
        quantity: z.number().int().min(1).optional(),
        qty: z.number().int().min(1).optional(),
      }),
    )
    .optional(),
});

// ─── Dashboard / computed views (declared before /:id) ──────────────────────

router.get(
  '/stats',
  requireRole(...OMS_ROLES, 'ANALYST'),
  async (req, res, next) => {
    try {
      res.json({ data: await orderService.getStats(buildCtx(req)) });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/queue',
  requireRole(...OMS_ROLES, 'ANALYST'),
  async (req, res, next) => {
    try {
      res.json({ data: await orderService.getQueue(buildCtx(req)) });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/suivi',
  requireRole('OMS_OPERATOR', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      res.json({ data: await orderService.getCarrierSuivi(buildCtx(req)) });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/retours',
  requireRole('OMS_OPERATOR', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      res.json({ data: await orderService.getRetours(buildCtx(req)) });
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
      res.json({
        data: await orderService.getAnalytics(req.query.period || '7d', buildCtx(req)),
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Order list & search (with 503 fallback) ────────────────────────────────

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
      const result = await orderService.getOrders(req.validatedQuery, buildCtx(req));
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

// ─── Create order (idempotent) ──────────────────────────────────────────────

router.post(
  '/',
  requireRole(...OMS_ROLES),
  validate(createOrderSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.createOrder(req.validated, buildCtx(req));
      res.status(201).json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Order detail ───────────────────────────────────────────────────────────

router.get(
  '/:id',
  requireRole(...OMS_ROLES, 'ANALYST'),
  async (req, res, next) => {
    try {
      const order = await orderService.getOrderById(req.params.id, buildCtx(req));
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

// ─── State mutations (PATCH from frontend → POST to Engine-A) ───────────────

router.patch(
  '/:id/return-action',
  requireRole(...OMS_ROLES),
  validate(returnActionSchema),
  async (req, res, next) => {
    try {
      const result = await orderService.handleReturnAction(
        req.params.id,
        req.validated.action,
        { items: req.validated.items, returnId: req.validated.returnId },
        buildCtx(req),
      );
      if (!result) return next(new AppError('NOT_FOUND', 'Retour introuvable.', 404));
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
      const order = await orderService.confirmOrder(req.params.id, req.user?.id, buildCtx(req));
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
        req.validated.reasonMessage || req.validated.reason,
        req.user?.id,
        buildCtx(req),
      );
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

// SYNC-6: deliver hook → /packed (Engine-A progresses on carrier webhooks).
router.patch(
  '/:id/deliver',
  requireRole(...OMS_ROLES),
  async (req, res, next) => {
    try {
      const order = await orderService.deliverOrder(req.params.id, req.user?.id, buildCtx(req));
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

// Carrier assignment is BFF-only metadata — Engine-A routes carriers from
// application.yml. We acknowledge the request and echo the order so the UI
// stays consistent.
router.patch(
  '/:id/assign-carrier',
  requireRole(...OMS_ROLES),
  validate(assignCarrierSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.assignCarrier(
        req.params.id,
        req.validated.carrier,
        req.user?.id,
        buildCtx(req),
      );
      if (!order) return next(new AppError('NOT_FOUND', 'Commande introuvable.', 404));
      res.json({ data: order });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
