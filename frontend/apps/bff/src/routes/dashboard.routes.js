const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ data: [{ id: "dashboard", status: "ok" }] });
});

module.exports = router;
