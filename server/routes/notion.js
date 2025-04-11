// server/routes/notion.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

require("dotenv").config();

router.post("/", async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: "데이터 누락" });
  }

  try {
    const response = await axios.post("https://api.notion.com/v1/pages", data, {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error("❌ Notion API 실패:", err.response?.data || err.message);
    res.status(500).json({ error: "Notion 저장 실패" });
  }
});

module.exports = router;
