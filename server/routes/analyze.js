const express = require("express");
const router = express.Router();
const { generateDetailStrategy } = require("../services/strategy");

router.post("/", async (req, res) => {
  const { title, thumbnail, memo, promptType } = req.body;

  try {
    const strategy = await generateDetailStrategy({
      title,
      thumbnail,
      memo,
      promptType,
    });
    res.json(strategy);
  } catch (error) {
    console.error("❌ GPT 상세 전략 오류:", error.message);
    res.status(500).json({ error: "GPT 전략 생성 실패" });
  }
});

module.exports = router;
