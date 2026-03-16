const express = require("express");
const notificationsMock = require("../mocks/notifications.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: notificationsMock });
});

module.exports = router;
