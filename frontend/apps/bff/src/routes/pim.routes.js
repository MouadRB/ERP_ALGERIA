const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const pimService = require('../services/pim.service');
const { AppError } = require('../errors/AppError');
const { z } = require('zod');

const router = express.Router();

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