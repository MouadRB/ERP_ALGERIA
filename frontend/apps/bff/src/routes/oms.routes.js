const express = require("express");
const omsMock = require("../mocks/oms.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: omsMock });
});

module.exports = router;
