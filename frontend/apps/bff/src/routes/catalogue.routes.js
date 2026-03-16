const express = require("express");
const catalogueMock = require("../mocks/catalogue.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: catalogueMock });
});

module.exports = router;
