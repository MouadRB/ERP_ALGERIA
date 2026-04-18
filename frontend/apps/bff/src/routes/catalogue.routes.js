const express = require('express');
const { z } = require('zod');
const { requireRole } = require('../middleware/rbac.middleware');
const { validate, validateQuery } = require('../middleware/validate.middleware');
const { paginationSchema } = require('../schemas/pagination.schema');
const catalogueService = require('../services/catalogue.service');
const { AppError } = require('../errors/AppError');

const router = express.Router();

router.get(
  '/',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  validateQuery(
    paginationSchema.extend({
      category: z.string().optional(),
      channel: z.string().optional(),
      maxPrice: z.coerce.number().optional(),
      minPrice: z.coerce.number().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      status: z.string().optional(),
      stockStatus: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const result = await catalogueService.getCatalogue(req.validatedQuery);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/stats',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      const stats = await catalogueService.getCatalogueStats();
      res.json({ data: stats });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/analytics',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      const analytics = await catalogueService.getCatalogueAnalytics();
      res.json({ data: analytics });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/channels',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      const channels = await catalogueService.getCatalogueChannels();
      res.json({ data: channels });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/opensearch/status',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      const status = await catalogueService.getOpenSearchStatus();
      res.json({ data: status });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/opensearch/reindex',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  async (_req, res, next) => {
    try {
      const status = await catalogueService.reindexOpenSearch();
      res.json({ data: status });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/categories',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (_req, res, next) => {
    try {
      const cats = await catalogueService.getCategories();
      res.json({ data: cats });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/categories',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      nameFr: z.string().min(1),
      nameAr: z.string().optional(),
      parentId: z.string().nullable().optional(),
      slug: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const cat = await catalogueService.createCategory(req.validated);
      res.status(201).json({ data: cat });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/categories/:catId',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      nameFr: z.string().optional(),
      nameAr: z.string().optional(),
      parentId: z.string().nullable().optional(),
      slug: z.string().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const cat = await catalogueService.updateCategory(req.params.catId, req.validated);
      if (!cat) return next(new AppError('NOT_FOUND', 'Categorie introuvable.', 404));
      res.json({ data: cat });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/categories/:catId',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const removed = await catalogueService.deleteCategory(req.params.catId);
      if (!removed) return next(new AppError('NOT_FOUND', 'Categorie introuvable.', 404));
      res.json({ data: { id: removed.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.getCatalogueItem(req.params.id);
      if (!entry) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  '/:id/history',
  requireRole('CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'SUPERADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const history = await catalogueService.getCatalogueHistory(req.params.id);
      if (history === null) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: history });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:id',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      nameFr: z.string().optional(),
      nameAr: z.string().optional(),
      categoryId: z.string().optional(),
      categoryPath: z.string().optional(),
      priceTTC: z.number().optional(),
      visibilityRules: z.any().optional(),
      metrics: z.any().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.updateCatalogueEntry(req.params.id, req.validated);
      if (!entry) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const removed = await catalogueService.deleteCatalogueEntry(req.params.id);
      if (!removed) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: { id: removed.id } });
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      productId: z.string().optional(),
      sku: z.string().optional(),
      nameFr: z.string().optional(),
      nameAr: z.string().optional(),
      categoryId: z.string().optional(),
      categoryPath: z.string().optional(),
      priceTTC: z.number().optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.createCatalogueEntry(req.validated);
      res.status(201).json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/publish',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.publishEntry(req.params.id);
      if (!entry) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/unpublish',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.unpublishEntry(req.params.id);
      if (!entry) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/mask',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.maskEntry(req.params.id);
      if (!entry) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/schedule',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      scheduledAt: z.string().min(5),
      type: z.enum(['publish', 'unpublish']).optional(),
    }),
  ),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.scheduleEntry(
        req.params.id,
        req.validated.scheduledAt,
        req.validated.type,
      );
      if (!entry) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/channels/:channelId',
  requireRole('CATALOGUE_MANAGER', 'SUPERADMIN'),
  validate(
    z.object({
      enabled: z.boolean(),
    }),
  ),
  async (req, res, next) => {
    try {
      const entry = await catalogueService.toggleChannelStatus(
        req.params.id,
        req.params.channelId,
        req.validated.enabled,
      );
      if (!entry) return next(new AppError('NOT_FOUND', 'Entree catalogue introuvable.', 404));
      res.json({ data: entry });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
