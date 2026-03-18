const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const customerService = require('../services/customer.service');
const { AppError } = require('../errors/AppError');
const { z } = require('zod');

const router = express.Router();

const CRM_ROLES = ['CRM_AGENT', 'SUPERADMIN'];

router.get(
  '/',
  requireRole(...CRM_ROLES, 'ANALYST'),
  validateQuery(paginationSchema.extend({ segment: z.string().optional() })),
  async (req, res, next) => {
    try {
      const result = await customerService.getCustomers(req.validatedQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  requireRole(...CRM_ROLES, 'ANALYST'),
  async (req, res, next) => {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (!customer) return next(new AppError('NOT_FOUND', 'Client introuvable.', 404));
      res.json({ data: customer });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;