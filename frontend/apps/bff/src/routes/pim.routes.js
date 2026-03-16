const express = require("express");
const pimMock = require("../mocks/pim.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: pimMock });
});

module.exports = router;
