const express = require('express');
const dashboardService = require('../services/dashboard.service');

const router = express.Router();

// Auth is enforced by the global `app.use('/bff', auth)` in index.js — this
// router is mounted under /bff, so every handler here runs post-auth with
// req.user populated. All FERZA roles are allowed to read the dashboard.
router.get('/', async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboard();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
