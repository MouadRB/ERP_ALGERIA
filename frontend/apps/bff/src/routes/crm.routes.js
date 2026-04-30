// ─────────────────────────────────────────────────────────────────────────────
// CRM routes — orchestrator on top of Engine-B.
//
// Engine-B (/api/crm) is the source of truth. Every handler delegates to
// customer.service / crm-tickets.service which call engine-b.client. There
// are NO mocks here.
//
// The frontend uses the historical short-form paths (/bff/crm, /bff/crm/:id,
// /bff/crm/lookup, /bff/crm/tickets, …). The CRM API contract also defines a
// /customers/* sub-prefix mirroring Engine-B's /api/crm/customers/*. We mount
// every customer handler on BOTH surfaces so the contract is satisfied and
// the existing frontend keeps working without modification.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const customerService = require('../services/customer.service');
const ticketsService  = require('../services/crm-tickets.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();

const CRM_ROLES      = ['CRM_AGENT', 'SUPERADMIN'];
const CRM_READ_ROLES = ['CRM_AGENT', 'SUPERADMIN', 'ANALYST'];

const buildCtx = (req) => ({ req });

// ── Validation schemas ─────────────────────────────────────────────────────

const customerQuerySchema = paginationSchema.extend({
  search:      z.string().optional(),
  segment:     z.string().optional(),
  wilayaCode:  z.string().optional(),
  blacklisted: z.preprocess(
    (v) => (v === 'true' ? true : v === 'false' ? false : undefined),
    z.boolean().optional(),
  ),
  sort:        z.enum(['last_order', 'ca_desc', 'commandes_desc', 'retour_desc', 'risque_desc', 'nom']).optional(),
  riskLevel:   z.string().optional(),
});

const ticketQuerySchema = paginationSchema.extend({
  customerId: z.string().optional(),
  status:     z.string().optional(),
  category:   z.string().optional(),
  priority:   z.string().optional(),
});

const blacklistQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

const interactionsQuerySchema = paginationSchema.extend({
  type: z.string().optional(),
});

const ordersQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
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

const interactionSchema = z.object({
  type:      z.enum(['Appel', 'WhatsApp', 'Email', 'Note', 'Commande']).default('Note'),
  direction: z.enum(['Inbound', 'Outbound']).optional(),
  subject:   z.string().optional(),
  content:   z.string().min(1, 'Contenu requis'),
});

// Merge accepts the Engine-B payload as-is (pass-through). We require at
// least one duplicate identifier so we don't forward an empty body.
const mergeSchema = z.object({
  duplicateCustomerId:  z.string().optional(),
  duplicateCustomerIds: z.array(z.string()).optional(),
  strategy:             z.string().optional(),
}).passthrough().refine(
  (v) => Boolean(v.duplicateCustomerId || (v.duplicateCustomerIds && v.duplicateCustomerIds.length)),
  { message: 'duplicateCustomerId ou duplicateCustomerIds est requis.', path: ['duplicateCustomerId'] },
);

const createTicketSchema = z.object({
  customerId:         z.string(),
  customerPhone:      z.string().optional(),
  customerNameFr:     z.string().optional(),
  customerWilayaCode: z.string().optional(),
  orderId:            z.string().nullable().optional(),
  category:           z.string().min(3),
  priority:           z.enum(['Faible', 'Normale', 'Haute', 'Critique', 'Low', 'Normal', 'High', 'Critical']).optional(),
  subject:            z.string().optional(),
  description:        z.string().optional(),
});

const updateTicketSchema = z.object({
  status:     z.string().optional(),
  priority:   z.string().optional(),
  agentId:    z.string().optional(),
  agentName:  z.string().optional(),
  escalated:  z.boolean().optional(),
  lastAction: z.string().optional(),
  note:       z.object({ content: z.string().min(1), author: z.string().min(1) }).optional(),
}).strict();

const escalateSchema = z.object({
  reason:    z.string().optional(),
  toAgentId: z.string().optional(),
}).passthrough();

const closeSchema = z.object({
  resolution: z.string().optional(),
  outcome:    z.string().optional(),
}).passthrough();

// Engine-B's AssignTicketRequest only carries AgentName — there's no agentId
// column on the ticket. We accept either an agentId or agentName from the
// frontend so the legacy UI keeps working, but at least one must be present.
const assignSchema = z.object({
  agentId:   z.string().optional(),
  agentName: z.string().optional(),
}).refine(
  (v) => Boolean((v.agentId && v.agentId.length) || (v.agentName && v.agentName.length)),
  { message: 'agentName ou agentId requis.', path: ['agentName'] },
);

// ── Reusable handlers — declared once, mounted on multiple route prefixes ──

const handle = (fn) => async (req, res, next) => {
  try { await fn(req, res, next); }
  catch (err) { next(err); }
};

// Customers
const onCustomersList = handle(async (req, res) => {
  res.json(await customerService.listCustomers(req.validatedQuery, buildCtx(req)));
});

const onCustomerCreate = handle(async (req, res) => {
  const customer = await customerService.createCustomer(req.validated, buildCtx(req));
  res.status(201).json({ data: customer });
});

const onCustomerLookup = handle(async (req, res, next) => {
  if (!req.query.phone) {
    return next(new AppError('VALIDATION_ERROR', 'phone est requis.', 400, 'phone'));
  }
  const customer = await customerService.phoneLookup(String(req.query.phone), buildCtx(req));
  res.json({ data: customer });
});

const onCustomerGet = handle(async (req, res, next) => {
  const customer = await customerService.getCustomer(req.params.id, buildCtx(req));
  if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
  res.json({ data: customer });
});

const onCustomerDetail = handle(async (req, res, next) => {
  const customer = await customerService.getCustomerDetail(req.params.id, buildCtx(req));
  if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
  res.json({ data: customer });
});

const onCustomerUpdate = handle(async (req, res, next) => {
  const customer = await customerService.updateCustomer(req.params.id, req.validated, buildCtx(req));
  if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
  res.json({ data: customer });
});

const onCustomerDelete = handle(async (req, res, next) => {
  const ok = await customerService.deleteCustomer(req.params.id, buildCtx(req));
  if (!ok) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
  res.status(204).end();
});

const onCustomerOrders = handle(async (req, res) => {
  res.json(await customerService.getCustomerOrders(req.params.id, req.validatedQuery ?? req.query, buildCtx(req)));
});

const onCustomerRisk = handle(async (req, res, next) => {
  const profile = await customerService.getRiskProfile(req.params.id, buildCtx(req));
  if (!profile) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
  res.json({ data: profile });
});

// Blacklist
const onBlacklistList = handle(async (req, res) => {
  res.json(await customerService.listBlacklist(req.validatedQuery ?? req.query, buildCtx(req)));
});

const onBlacklistAdd = handle(async (req, res, next) => {
  const customer = await customerService.addToBlacklist(req.params.id, req.validated, buildCtx(req));
  if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
  res.json({ data: customer });
});

const onBlacklistRemove = handle(async (req, res, next) => {
  const customer = await customerService.removeFromBlacklist(req.params.id, buildCtx(req));
  if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
  res.json({ data: customer });
});

// Merge — pass-through
const onMerge = handle(async (req, res) => {
  const customer = await customerService.mergeCustomer(req.params.id, req.validated, buildCtx(req));
  res.json({ data: customer });
});

// Interactions
const onInteractionsList = handle(async (req, res) => {
  res.json(await customerService.listInteractions(req.params.id, req.validatedQuery ?? req.query, buildCtx(req)));
});

const onInteractionAdd = handle(async (req, res) => {
  const interaction = await customerService.addInteraction(req.params.id, req.validated, buildCtx(req));
  res.status(201).json({ data: interaction });
});

// Tickets
const onTicketsList = handle(async (req, res) => {
  res.json(await ticketsService.listTickets(req.validatedQuery, buildCtx(req)));
});

const onTicketStats = handle(async (req, res) => {
  res.json({ data: await ticketsService.getTicketStats(buildCtx(req)) });
});

const onTicketGet = handle(async (req, res, next) => {
  const ticket = await ticketsService.getTicket(req.params.id, buildCtx(req));
  if (!ticket) return next(new AppError('NOT_FOUND', 'Ticket introuvable.', 404));
  res.json({ data: ticket });
});

const onTicketCreate = handle(async (req, res) => {
  const ticket = await ticketsService.createTicket(req.validated, buildCtx(req));
  res.status(201).json({ data: ticket });
});

const onTicketUpdate = handle(async (req, res, next) => {
  const ticket = await ticketsService.updateTicket(req.params.id, req.validated, buildCtx(req));
  if (!ticket) return next(new AppError('NOT_FOUND', 'Ticket introuvable.', 404));
  res.json({ data: ticket });
});

const onTicketDelete = handle(async (req, res, next) => {
  const ok = await ticketsService.deleteTicket(req.params.id, buildCtx(req));
  if (!ok) return next(new AppError('NOT_FOUND', 'Ticket introuvable.', 404));
  res.status(204).end();
});

const onTicketEscalate = handle(async (req, res, next) => {
  const ticket = await ticketsService.escalateTicket(req.params.id, req.validated, buildCtx(req));
  if (!ticket) return next(new AppError('NOT_FOUND', 'Ticket introuvable.', 404));
  res.json({ data: ticket });
});

const onTicketClose = handle(async (req, res, next) => {
  const ticket = await ticketsService.closeTicket(req.params.id, req.validated, buildCtx(req));
  if (!ticket) return next(new AppError('NOT_FOUND', 'Ticket introuvable.', 404));
  res.json({ data: ticket });
});

const onTicketAssign = handle(async (req, res, next) => {
  const ticket = await ticketsService.assignTicket(req.params.id, req.validated, buildCtx(req));
  if (!ticket) return next(new AppError('NOT_FOUND', 'Ticket introuvable.', 404));
  res.json({ data: ticket });
});

// Analytics & metadata
const onStats = handle(async (req, res) => {
  res.json({ data: await customerService.getStats(buildCtx(req)) });
});

const onAnalytics = handle(async (req, res) => {
  res.json({ data: await customerService.getAnalytics(req.query.period, buildCtx(req)) });
});

const onFilters = handle(async (req, res) => {
  res.json({ data: await customerService.getFiltersMetadata(buildCtx(req)) });
});

// ── Route registration ─────────────────────────────────────────────────────
//
// Order matters: more specific paths must precede parametrized ones, and
// every static segment under the root (/stats, /analytics, /lookup, /tickets,
// /customers) must be declared before the catch-all /:id.

// Analytics & metadata (root-level static)
router.get('/stats',     requireRole(...CRM_READ_ROLES), onStats);
router.get('/analytics', requireRole(...CRM_READ_ROLES), onAnalytics);
router.get('/filters',   requireRole(...CRM_READ_ROLES), onFilters);
router.get('/lookup',    requireRole(...CRM_READ_ROLES), onCustomerLookup);

// Tickets — collection routes BEFORE /:id-style routes
router.get('/tickets/stats', requireRole(...CRM_READ_ROLES), onTicketStats);
router.get('/tickets',       requireRole(...CRM_READ_ROLES), validateQuery(ticketQuerySchema), onTicketsList);
router.post('/tickets',      requireRole(...CRM_ROLES), validate(createTicketSchema), onTicketCreate);

// Ticket actions (more specific than /tickets/:id)
router.post('/tickets/:id/escalate', requireRole(...CRM_ROLES), validate(escalateSchema), onTicketEscalate);
router.post('/tickets/:id/close',    requireRole(...CRM_ROLES), validate(closeSchema),    onTicketClose);
router.post('/tickets/:id/assign',   requireRole(...CRM_ROLES), validate(assignSchema),   onTicketAssign);

// Ticket /:id terminal verbs
router.get('/tickets/:id',    requireRole(...CRM_READ_ROLES), onTicketGet);
router.put('/tickets/:id',    requireRole(...CRM_ROLES), validate(updateTicketSchema), onTicketUpdate);
router.patch('/tickets/:id',  requireRole(...CRM_ROLES), validate(updateTicketSchema), onTicketUpdate);
router.delete('/tickets/:id', requireRole(...CRM_ROLES), onTicketDelete);

// Customers — /customers/* (per spec). Static segments first.
router.get('/customers/blacklist',   requireRole(...CRM_READ_ROLES), validateQuery(blacklistQuerySchema), onBlacklistList);
router.get('/customers/lookup',      requireRole(...CRM_READ_ROLES), onCustomerLookup);
router.get('/customers',             requireRole(...CRM_READ_ROLES), validateQuery(customerQuerySchema), onCustomersList);
router.post('/customers',            requireRole(...CRM_ROLES), validate(createCustomerSchema), onCustomerCreate);

// Customer sub-resources
router.get('/customers/:id/detail',        requireRole(...CRM_READ_ROLES), onCustomerDetail);
router.get('/customers/:id/orders',        requireRole(...CRM_READ_ROLES), validateQuery(ordersQuerySchema), onCustomerOrders);
router.get('/customers/:id/risk-profile',  requireRole(...CRM_READ_ROLES), onCustomerRisk);
router.get('/customers/:id/risk',          requireRole(...CRM_READ_ROLES), onCustomerRisk);
router.get('/customers/:id/interactions',  requireRole(...CRM_READ_ROLES), validateQuery(interactionsQuerySchema), onInteractionsList);
router.post('/customers/:id/interactions', requireRole(...CRM_ROLES),      validate(interactionSchema), onInteractionAdd);
router.post('/customers/:id/merge',        requireRole(...CRM_ROLES),      validate(mergeSchema), onMerge);
router.post('/customers/:id/blacklist',    requireRole(...CRM_ROLES),      validate(blacklistSchema), onBlacklistAdd);
router.delete('/customers/:id/blacklist',  requireRole('SUPERADMIN'),      onBlacklistRemove);

// Customer /:id terminal verbs (must come AFTER all sub-resources)
router.get('/customers/:id',    requireRole(...CRM_READ_ROLES), onCustomerGet);
router.put('/customers/:id',    requireRole(...CRM_ROLES), validate(updateCustomerSchema), onCustomerUpdate);
router.patch('/customers/:id',  requireRole(...CRM_ROLES), validate(updateCustomerSchema), onCustomerUpdate);
router.delete('/customers/:id', requireRole(...CRM_ROLES), onCustomerDelete);

// ── Frontend-compatibility surface ─────────────────────────────────────────
// The existing frontend talks to /bff/crm/... directly (no /customers prefix).
// These aliases route to the same handlers so the frontend keeps working
// without modification.

router.get('/',       requireRole(...CRM_READ_ROLES), validateQuery(customerQuerySchema), onCustomersList);
router.post('/',      requireRole(...CRM_ROLES),      validate(createCustomerSchema), onCustomerCreate);

router.get('/:id/risk',          requireRole(...CRM_READ_ROLES), onCustomerRisk);
router.get('/:id/orders',        requireRole(...CRM_READ_ROLES), validateQuery(ordersQuerySchema), onCustomerOrders);
router.get('/:id/interactions',  requireRole(...CRM_READ_ROLES), validateQuery(interactionsQuerySchema), onInteractionsList);
router.post('/:id/interactions', requireRole(...CRM_ROLES),      validate(interactionSchema), onInteractionAdd);
router.patch('/:id/blacklist',   requireRole(...CRM_ROLES),      validate(blacklistSchema), onBlacklistAdd);
router.post('/:id/blacklist',    requireRole(...CRM_ROLES),      validate(blacklistSchema), onBlacklistAdd);
router.delete('/:id/blacklist',  requireRole('SUPERADMIN'),      onBlacklistRemove);
router.post('/:id/merge',        requireRole(...CRM_ROLES),      validate(mergeSchema), onMerge);

router.get('/:id',    requireRole(...CRM_READ_ROLES), onCustomerGet);
router.put('/:id',    requireRole(...CRM_ROLES),      validate(updateCustomerSchema), onCustomerUpdate);
router.patch('/:id',  requireRole(...CRM_ROLES),      validate(updateCustomerSchema), onCustomerUpdate);
router.delete('/:id', requireRole(...CRM_ROLES),      onCustomerDelete);

module.exports = router;
