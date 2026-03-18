const express = require('express');
const dashboardService = require('../services/dashboard.service');

const router = express.Router();

// Dashboard is accessible to all authenticated roles
router.get('/', async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboard();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;