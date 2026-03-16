const express = require("express");
const parametresMock = require("../mocks/parametres.mock");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: parametresMock });
});

module.exports = router;
