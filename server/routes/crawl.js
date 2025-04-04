const express = require("express");
const router = express.Router();
const crawlAllPlatforms = require("../services/crawler");

router.post("/", async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const videos = await crawlAllPlatforms(query);
    res.json(videos);
  } catch (error) {
    console.error("❌ 서버 오류:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
