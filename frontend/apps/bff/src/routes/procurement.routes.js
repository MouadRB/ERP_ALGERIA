const express = require("express");
const procurementMock = require("../mocks/procurement.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: procurementMock });
});

module.exports = router;
