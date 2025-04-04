const express = require("express");
const router = express.Router();
const crawlAllPlatforms = require("../services/crawler");

router.post("/", async (req, res) => {
  const { query } = req.body;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const onLog = (msg) => {
    res.write(`LOG:${msg}\n`);
  };

  try {
    const videos = await crawlAllPlatforms(query, { onLog });
    res.write(`RESULT:${JSON.stringify(videos)}\n`);
  } catch (error) {
    res.write(`LOG:❌ 서버 오류: ${error.message}\n`);
  } finally {
    res.end();
  }
});

module.exports = router;
