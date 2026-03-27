const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const customerService = require('../services/customer.service');
const ticketsService  = require('../services/crm-tickets.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();

const CRM_ROLES       = ['CRM_AGENT', 'SUPERADMIN'];
const CRM_READ_ROLES  = ['CRM_AGENT', 'SUPERADMIN', 'ANALYST'];

// ─── Query schemas ────────────────────────────────────────────────────────────

const VALID_SEGMENTS = ['VIP', 'Fidèle', 'Nouveau', 'Inactif', 'A risque', 'Liste noire'];
const VALID_SORTS    = ['last_order', 'ca_desc', 'commandes_desc', 'retour_desc', 'risque_desc', 'nom'];

const customerQuerySchema = paginationSchema.extend({
  segment:     z.string().optional(),
  wilayaCode:  z.string().optional(),
  blacklisted: z.preprocess((v) => v === 'true' ? true : v === 'false' ? false : undefined, z.boolean().optional()),
  sort:        z.enum(['last_order', 'ca_desc', 'commandes_desc', 'retour_desc', 'risque_desc', 'nom']).optional(),
  riskLevel:   z.string().optional(),
});

const ticketQuerySchema = paginationSchema.extend({
  customerId: z.string().optional(),
  status:     z.string().optional(),
  category:   z.string().optional(),
  priority:   z.string().optional(),
});

const createCustomerSchema = z.object({
  phone:      z.string().regex(/^0[567]\d{8}$/, 'Numéro de téléphone algérien invalide (format: 0[567]XXXXXXXX)'),
  nameFr:     z.string().min(2, 'Nom requis'),
  nameAr:     z.string().optional(),
  wilayaCode: z.string().min(1).optional(),
  commune:    z.string().optional(),
  address:    z.string().optional(),
  email:      z.string().email().optional().nullable(),
});

const updateCustomerSchema = z.object({
  nameFr:            z.string().min(2).optional(),
  nameAr:            z.string().optional(),
  phoneSec:          z.string().nullable().optional(),
  commune:           z.string().nullable().optional(),
  address:           z.string().optional(),
  wilayaCode:        z.string().optional(),
  email:             z.string().email().nullable().optional(),
  preferredChannel:  z.enum(['telephone', 'whatsapp', 'both']).nullable().optional(),
  preferredLanguage: z.enum(['darija', 'français', 'arabe']).nullable().optional(),
}).strict();

const blacklistSchema = z.object({
  motif:  z.string().min(3, 'Motif requis'),
  reason: z.string().optional(),
});

const createTicketSchema = z.object({
  customerId:       z.string(),
  customerPhone:    z.string().optional(),
  customerNameFr:   z.string().optional(),
  customerWilayaCode: z.string().optional(),
  orderId:          z.string().nullable().optional(),
  category:         z.string().min(3),
  priority:         z.enum(['Faible', 'Normale', 'Haute', 'Critique']).optional(),
  subject:          z.string().optional(),
  description:      z.string().optional(),
});

const updateTicketSchema = z.object({
  status:     z.string().optional(),
  agentId:    z.string().optional(),
  agentName:  z.string().optional(),
  escalated:  z.boolean().optional(),
  lastAction: z.string().optional(),
  note:       z.object({ content: z.string().min(1), author: z.string().min(1) }).optional(),
}).strict();

// ─── Customer routes ──────────────────────────────────────────────────────────

// GET /bff/crm/stats — KPI card values (must be before /:id)
router.get(
  '/stats',
  requireRole(...CRM_READ_ROLES),
  async (req, res, next) => {
    try {
      const stats = await customerService.getCRMStats();
      res.json({ data: stats });
    } catch (err) { next(err); }
  },
);

// GET /bff/crm/analytics?period=30d|90d|ytd
router.get(
  '/analytics',
  requireRole(...CRM_READ_ROLES),
  async (req, res, next) => {
    try {
      const analytics = await customerService.getCRMAnalytics(req.query.period);
      res.json({ data: analytics });
    } catch (err) { next(err); }
  },
);

// GET /bff/crm/lookup?phone=
router.get(
  '/lookup',
  requireRole(...CRM_READ_ROLES),
  async (req, res, next) => {
    try {
      const { phone } = req.query;
      if (!phone) return next(new AppError('VALIDATION_ERROR', 'phone est requis.', 400));
      const customer = await customerService.phoneLookup(phone);
      res.json({ data: customer });
    } catch (err) { next(err); }
  },
);

// GET /bff/crm/tickets — ticket list (must be before /:id)
router.get(
  '/tickets',
  requireRole(...CRM_READ_ROLES),
  validateQuery(ticketQuerySchema),
  async (req, res, next) => {
    try {
      const result = await ticketsService.getTickets(req.validatedQuery);
      res.json(result);
    } catch (err) { next(err); }
  },
);

// GET /bff/crm — customer list
router.get(
  '/',
  requireRole(...CRM_READ_ROLES),
  validateQuery(customerQuerySchema),
  async (req, res, next) => {
    try {
      const result = await customerService.getCustomers(req.validatedQuery);
      res.json(result);
    } catch (err) { next(err); }
  },
);

// POST /bff/crm — create customer
router.post(
  '/',
  requireRole(...CRM_ROLES),
  validate(createCustomerSchema),
  async (req, res, next) => {
    try {
      const customer = await customerService.createCustomer(req.validated);
      res.status(201).json({ data: customer });
    } catch (err) { next(err); }
  },
);

// POST /bff/crm/tickets — create ticket
router.post(
  '/tickets',
  requireRole(...CRM_ROLES),
  validate(createTicketSchema),
  async (req, res, next) => {
    try {
      const ticket = await ticketsService.createTicket(req.validated);
      res.status(201).json({ data: ticket });
    } catch (err) { next(err); }
  },
);

// PATCH /bff/crm/tickets/:id — update ticket
router.patch(
  '/tickets/:id',
  requireRole(...CRM_ROLES),
  validate(updateTicketSchema),
  async (req, res, next) => {
    try {
      const ticket = await ticketsService.updateTicket(req.params.id, req.validated);
      if (!ticket) return next(new AppError('NOT_FOUND', 'Ticket introuvable.', 404));
      res.json({ data: ticket });
    } catch (err) { next(err); }
  },
);

// GET /bff/crm/:id — single customer
router.get(
  '/:id',
  requireRole(...CRM_READ_ROLES),
  async (req, res, next) => {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
      res.json({ data: customer });
    } catch (err) { next(err); }
  },
);

// PATCH /bff/crm/:id — update customer
router.patch(
  '/:id',
  requireRole(...CRM_ROLES),
  validate(updateCustomerSchema),
  async (req, res, next) => {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.validated);
      if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
      res.json({ data: customer });
    } catch (err) { next(err); }
  },
);

// PATCH /bff/crm/:id/blacklist — add to blacklist
router.patch(
  '/:id/blacklist',
  requireRole(...CRM_ROLES),
  validate(blacklistSchema),
  async (req, res, next) => {
    try {
      const customer = await customerService.blacklistCustomer(
        req.params.id,
        req.validated.motif,
        req.validated.reason,
        req.user?.nameFr,
      );
      if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
      res.json({ data: customer });
    } catch (err) { next(err); }
  },
);

// DELETE /bff/crm/:id/blacklist — remove from blacklist
router.delete(
  '/:id/blacklist',
  requireRole('SUPERADMIN'),
  async (req, res, next) => {
    try {
      const customer = await customerService.removeFromBlacklist(req.params.id);
      if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
      res.json({ data: customer });
    } catch (err) { next(err); }
  },
);

// GET /bff/crm/:id/risk — risk profile
router.get(
  '/:id/risk',
  requireRole(...CRM_READ_ROLES),
  async (req, res, next) => {
    try {
      const profile = await customerService.getRiskProfile(req.params.id);
      if (!profile) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
      res.json({ data: profile });
    } catch (err) { next(err); }
  },
);

module.exports = router;
