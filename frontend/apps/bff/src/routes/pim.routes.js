const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const pimService = require('../services/pim.service');
const { AppError } = require('../errors/AppError');
const env = require('../config/env');
const { requestEngineA } = require('../lib/backend-client');

const router = express.Router();

const productPayloadSchema = z.object({
  sku: z.string().optional(),
  nameFr: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionAr: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierName: z.string().optional(),
  supplierRef: z.string().optional(),
  priceHT: z.number().optional(),
  priceTTC: z.number().optional(),
  costFifo: z.number().optional(),
  tvaRate: z.enum(['standard', 'reduced', 'exempt']).optional(),
  status: z.enum(['active', 'draft', 'archived', 'ocr_import']).optional(),
  returnRate: z.number().optional(),
  mdmConfirmed: z.boolean().optional(),
  returnPolicy: z.string().optional(),
  wilayasRestreintes: z.array(z.string()).optional(),
  priceHistory: z.array(z.any()).optional(),
  variants: z.array(z.any()).optional(),
  mediaUrls: z.array(z.string()).optional(),
  dimensions: z
    .object({
      lengthCm: z.number(),
      widthCm: z.number(),
      heightCm: z.number(),
    })
    .nullable()
    .optional(),
  weightKg: z.number().optional(),
  emballage: z.any().optional(),
  stockManagement: z.any().optional(),
  attributes: z.array(z.any()).optional(),
}).passthrough();

// Lightweight search endpoint for OMS order creation and procurement BC wizard
router.get(
  '/products',
  requireRole('OMS_OPERATOR', 'PROCUREMENT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      if (env.useMock) {
        const products = require('../mocks/pim.mock').products;
        const q = (req.query.search ?? '').toString().toLowerCase();
        const filtered = q
          ? products.filter(
            (p) =>
              p.nameFr.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q),
          )
          : products;
        const shaped = filtered.slice(0, 20).map((p) => ({
          id: p.id,
          sku: p.sku,
          nameFr: p.nameFr,
          nameAr: p.nameAr,
          priceTTC: p.priceTTC,
          tvaRate: p.tvaRate,
          imageUrl: p.mediaUrls?.[0] ?? null,
        }));
        return res.json({ data: shaped, meta: { total: filtered.length } });
      }

      const result = await requestEngineA(req.user, '/pim/v1/products', {
        query: {
          search: req.query.search || undefined,
          page: 0,
          size: 20,
        },
      });

      const items = (result?.data ?? []).map((p) => ({
        id: p.productId,
        sku: p.skuCode,
        nameFr: p.nameFr ?? '',
        nameAr: p.nameAr ?? '',
        priceTTC: 0,
        tvaRate: 'standard',
        imageUrl: null,
      }));

      return res.json({ data: items, meta: { total: result?.pagination?.totalElements ?? items.length } });
    } catch (err) {
      next(err);
    }
  },
);

const bulkIdsSchema = z.object({
  ids: z.array(z.string()).min(1),
});

const variantSchema = z.object({
  variantId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().nullable().optional(),
  attributes: z.record(z.string()).optional(),
  priceTTC: z.number().optional(),
  costFifo: z.number().optional(),
});

router.patch(
  '/bulk/status',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(
    bulkIdsSchema.extend({
      status: z.enum(['active', 'draft', 'archived', 'ocr_import', 'discontinued', 'signaled']),
    }),
  ),
  async (req, res, next) => {
    try {
      const { ids, status } = req.validated;
      const updated = await pimService.bulkChangeStatus(req.user, ids, status);
      res.json({ data: updated, meta: { count: updated.length } });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/bulk/tva',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(
    bulkIdsSchema.extend({
      tvaRate: z.enum(['standard', 'reduced', 'exempt']),
    }),
  ),
  async (req, res, next) => {
    try {
      const { ids, tvaRate } = req.validated;
      const updated = await pimService.bulkChangeTva(req.user, ids, tvaRate);
      res.json({ data: updated, meta: { count: updated.length } });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/bulk/supplier',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(bulkIdsSchema.extend({ supplierName: z.string().min(1) })),
  async (req, res, next) => {
    try {
      const { ids, supplierName } = req.validated;
      const updated = await pimService.bulkChangeSupplier(req.user, ids, supplierName);
      res.json({ data: updated, meta: { count: updated.length } });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/bulk/export',
  requireRole('PRODUCT_MANAGER', 'CATALOGUE_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validate(
    z.object({
      ids: z.array(z.string()).optional(),
      columns: z.array(z.string()).optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const { ids = [], columns = [] } = req.validated;
      const result = await pimService.bulkExport(req.user, ids, columns);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/bulk/plan-reappro',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(
    bulkIdsSchema.extend({
      date: z.string().optional(),
      qty: z.number().nonnegative().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const { ids, date, qty } = req.validated;
      const result = await pimService.bulkPlanReappro(req.user, ids, { date, qty });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:id/variants',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(variantSchema),
  async (req, res, next) => {
    try {
      const product = await pimService.addVariant(req.user, req.params.id, req.validated);
      if (!product) return next(new AppError('NOT_FOUND', 'Produit introuvable.', 404));
      res.status(201).json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/restrictions',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      wilayasRestreintes: z.array(z.string()),
    }),
  ),
  async (req, res, next) => {
    try {
      const product = await pimService.updateRestrictions(req.user, req.params.id, req.validated);
      if (!product) return next(new AppError('NOT_FOUND', 'Produit introuvable.', 404));
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/',
  requireRole('PRODUCT_MANAGER', 'CATALOGUE_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(
    paginationSchema.extend({
      status: z.string().optional(),
      categoryId: z.string().optional(),
      supplier: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const result = await pimService.getProducts(req.user, req.validatedQuery);
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
      const product = await pimService.getProductById(req.user, req.params.id);
      if (!product) return next(new AppError('NOT_FOUND', 'Produit introuvable.', 404));
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(productPayloadSchema),
  async (req, res, next) => {
    try {
      const product = await pimService.createProduct(req.user, req.validated);
      res.status(201).json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/ocr-import',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      imageUrl: z.string().url().or(z.string().min(1)).optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const data = await pimService.importOCRProducts(req.user, req.validated);
      res.status(201).json({ data, meta: { total: data.length } });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(productPayloadSchema),
  async (req, res, next) => {
    try {
      const product = await pimService.updateProduct(req.user, req.params.id, req.validated);
      if (!product) return next(new AppError('NOT_FOUND', 'Produit introuvable.', 404));
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:id',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  validate(productPayloadSchema),
  async (req, res, next) => {
    try {
      const product = await pimService.updateProduct(req.user, req.params.id, req.validated);
      if (!product) return next(new AppError('NOT_FOUND', 'Produit introuvable.', 404));
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  requireRole('PRODUCT_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const product = await pimService.archiveProduct(req.user, req.params.id);
      if (!product) return next(new AppError('NOT_FOUND', 'Produit introuvable.', 404));
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
