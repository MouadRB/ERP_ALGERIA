const express = require("express");
const rapportsMock = require("../mocks/rapports.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: rapportsMock });
});

module.exports = router;
