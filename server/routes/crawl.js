const express = require("express");
const router = express.Router();
const crawlAllPlatforms = require("../services/crawler");

router.post("/", async (req, res) => {
  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ error: "keyword is required" });
  }

  try {
    const data = await crawlAllPlatforms(keyword);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "크롤링 실패", details: err.message });
  }
});

module.exports = router;
