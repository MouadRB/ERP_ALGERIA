const express = require("express");
const inventoryMock = require("../mocks/inventory.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: inventoryMock });
});

module.exports = router;
