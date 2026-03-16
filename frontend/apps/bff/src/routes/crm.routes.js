const express = require("express");
const crmMock = require("../mocks/crm.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: crmMock });
});

module.exports = router;
