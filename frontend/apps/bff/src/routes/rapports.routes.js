const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const rapportsService = require('../services/rapports.service');

const router = express.Router();

const ROLES = ['ANALYST', 'SUPERADMIN', 'FINANCE_DIRECTOR'];

const periodSchema = z.object({
  period:     z.enum(['today', '7d', '30d', 'quarter', 'year']).optional(),
  comparison: z.preprocess((v) => v === 'true', z.boolean().optional()),
});

// GET /bff/rapports/overview — Vue d'Ensemble
router.get('/overview', requireRole(...ROLES), validateQuery(periodSchema), async (req, res, next) => {
  try {
    const { period = '30d', comparison = false } = req.validatedQuery || {};
    const data = await rapportsService.getOverview(period, comparison);
    res.json({ data });
  } catch (err) { next(err); }
});

// GET /bff/rapports/ventes — Ventes & OMS
router.get('/ventes', requireRole(...ROLES), validateQuery(periodSchema), async (req, res, next) => {
  try {
    const { period = '30d', comparison = false } = req.validatedQuery || {};
    const data = await rapportsService.getVentesOms(period, comparison);
    res.json({ data });
  } catch (err) { next(err); }
});

// GET /bff/rapports/produits — Produits & Catalogue
router.get('/produits', requireRole(...ROLES), validateQuery(periodSchema), async (req, res, next) => {
  try {
    const { period = '30d', comparison = false } = req.validatedQuery || {};
    const data = await rapportsService.getProduitsCatalogue(period, comparison);
    res.json({ data });
  } catch (err) { next(err); }
});

// GET /bff/rapports/inventaire — Inventaire & Stock
router.get('/inventaire', requireRole(...ROLES), validateQuery(periodSchema), async (req, res, next) => {
  try {
    const { period = '30d', comparison = false } = req.validatedQuery || {};
    const data = await rapportsService.getInventaireStock(period, comparison);
    res.json({ data });
  } catch (err) { next(err); }
});

// GET /bff/rapports/clients — Clients & CRM
router.get('/clients', requireRole(...ROLES), validateQuery(periodSchema), async (req, res, next) => {
  try {
    const { period = '30d', comparison = false } = req.validatedQuery || {};
    const data = await rapportsService.getClientsCrm(period, comparison);
    res.json({ data });
  } catch (err) { next(err); }
});

// GET /bff/rapports/approvisionnement — Approvisionnement
router.get('/approvisionnement', requireRole(...ROLES), validateQuery(periodSchema), async (req, res, next) => {
  try {
    const { period = '30d', comparison = false } = req.validatedQuery || {};
    const data = await rapportsService.getApprovisionnement(period, comparison);
    res.json({ data });
  } catch (err) { next(err); }
});

// GET /bff/rapports/cross-module — Cross-Module
router.get('/cross-module', requireRole(...ROLES), validateQuery(periodSchema), async (req, res, next) => {
  try {
    const { period = '30d', comparison = false } = req.validatedQuery || {};
    const data = await rapportsService.getCrossModule(period, comparison);
    res.json({ data });
  } catch (err) { next(err); }
});

module.exports = router;
