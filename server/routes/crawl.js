const express = require("express");
const router = express.Router();
const crawlContents = require("../services/crawler");

router.post("/", async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) return res.status(400).json({ error: "keyword is required" });

  try {
    const data = await crawlContents(keyword);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "크롤링 실패" });
  }
});

module.exports = router;
