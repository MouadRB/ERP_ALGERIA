const express = require('express');
const notificationsService = require('../services/notifications.service');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await notificationsService.getNotifications(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;