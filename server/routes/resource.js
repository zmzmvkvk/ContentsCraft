const express = require("express");
const { searchPixabay } = require("../services/resourceService");

const router = express.Router();

router.get("/pixabay", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "쿼리 누락됨" });

  try {
    const result = await searchPixabay(q);
    res.json(result);
  } catch (err) {
    console.error("Pixabay 에러:", err.message);
    res.status(500).json({ error: "서버 에러" });
  }
});

module.exports = router;
