const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const pimService = require('../services/pim.service');
const { AppError } = require('../errors/AppError');
const { z } = require('zod');
const env = require('../config/env');

const router = express.Router();

// Lightweight search endpoint for OMS order creation
router.get(
  '/products',
  requireRole('OMS_OPERATOR', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      if (env.useMock) {
        const products = require('../mocks/pim-products.mock');
        const q = (req.query.search ?? '').toString().toLowerCase();
        const filtered = q
          ? products.filter(
            (p) =>
              p.nameFr.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q),
          )
          : products;
        return res.json({ data: filtered.slice(0, 20), meta: { total: filtered.length } });
      }

      const params = new URLSearchParams();
      if (req.query.search) params.set('search', req.query.search.toString());
      const response = await fetch(`${env.engineAUrl}/pim/products?${params.toString()}`);
      if (!response.ok) throw new Error(`Engine A error: ${response.status}`);
      const json = await response.json();
      res.json(json);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/',
  requireRole('PRODUCT_MANAGER', 'CATALOGUE_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(paginationSchema.extend({ status: z.string().optional() })),
  async (req, res, next) => {
    try {
      const result = await pimService.getProducts(req.validatedQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  requireRole('PRODUCT_MANAGER', 'CATALOGUE_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const product = await pimService.getProductById(req.params.id);
      if (!product) return next(new AppError('NOT_FOUND', 'Produit introuvable.', 404));
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
