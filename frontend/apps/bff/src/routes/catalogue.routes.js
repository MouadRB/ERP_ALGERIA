const express = require('express');
const { requireRole } = require('../middleware/rbac.middleware');
const { validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const catalogueMock = require('../mocks/catalogue.mock');
const { transformCatalogueList } = require('../transformers/catalogue.transformer');

const router = express.Router();

router.get(
  '/',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const { page = 1, pageSize = 20 } = req.validatedQuery;
      const total = catalogueMock.length;
      const data = catalogueMock.slice((page - 1) * pageSize, page * pageSize);
      res.json({ data: transformCatalogueList(data), meta: { total, page, pageSize } });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;