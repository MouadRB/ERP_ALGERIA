const express = require('express');
const dashboardService = require('../services/dashboard.service');

const router = express.Router();

// Auth is enforced by the global `app.use('/bff', auth)` mount in index.js, so
// every handler below runs post-auth with `req.user` populated. engine-b is
// what enforces the OrdersRead / OrdersWrite policies — the BFF only gates
// the request shape and forwards the call.

// ─── Reads ──────────────────────────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardSummary(req);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/kpis', async (req, res, next) => {
  try {
    const data = await dashboardService.getKpis(req);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/confirmation-queue', async (req, res, next) => {
  try {
    const data = await dashboardService.getConfirmationQueue(req);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/cod-funnel', async (req, res, next) => {
  try {
    const data = await dashboardService.getCodFunnel(req);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/risk-score', async (req, res, next) => {
  try {
    const data = await dashboardService.getRiskScore(req);
    res.json({ data });
  } catch (err) { next(err); }
});

// ─── Mutations (OrdersWrite enforced upstream by engine-b) ──────────────────

router.post('/orders/:id/confirm', async (req, res, next) => {
  try {
    const data = await dashboardService.confirmOrder(req.params.id, req);
    res.json({ data });
  } catch (err) { next(err); }
});

router.post('/orders/confirm-all', async (req, res, next) => {
  try {
    const data = await dashboardService.confirmAllPending(req);
    res.json({ data });
  } catch (err) { next(err); }
});

module.exports = router;
