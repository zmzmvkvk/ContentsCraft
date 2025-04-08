const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");

router.get("/", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--lang=zh-CN,zh"],
      defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto(
      "https://playboard.co/chart/short/most-viewed-all-videos-in-worldwide-weekly",
      {
        waitUntil: "domcontentloaded",
      }
    );

    const channels = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("tr.chart__row"));
      const names = rows
        .filter((row) => !row.innerText.includes("Ad")) // 광고 제외
        .slice(0, 10)
        .map((row) => {
          const nameSpan = row.querySelector(".channel .name");
          return nameSpan?.innerText?.trim() || null;
        })
        .filter(Boolean);
      return names;
    });

    await browser.close();
    res.json({ success: true, channels });
  } catch (err) {
    console.error("크롤링 오류:", err.message);
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
