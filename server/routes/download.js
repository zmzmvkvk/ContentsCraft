const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const puppeteer = require("puppeteer");
const https = require("https");
const { PassThrough } = require("stream");

router.post("/", async (req, res) => {
  const { platform, videoUrl } = req.body;
  console.log("[요청 수신] ▶️", { platform, videoUrl });

  if (platform === "douyin") {
    try {
      // ✅ puppeteer 기반 douyin 다운로드 처리
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/89 Safari/537.36"
      );

      await page.goto(videoUrl, { waitUntil: "networkidle2" });

      // ▶️ 영상 src 추출
      const videoSrc = await page.evaluate(() => {
        const video = document.querySelector("video");
        return video ? video.src : null;
      });

      if (!videoSrc) {
        await browser.close();
        console.error("❌ 영상 src를 찾을 수 없습니다.");
        return res.status(500).json({ error: "영상 URL 추출 실패" });
      }

      console.log("🎯 추출된 Douyin 영상 src:", videoSrc);

      // ▶️ 다운로드 스트리밍 전달
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="douyin_video.mp4"`
      );
      res.setHeader("Content-Type", "video/mp4");

      https.get(videoSrc, (streamRes) => {
        const passthrough = new PassThrough();
        streamRes.pipe(passthrough).pipe(res);
      });

      await browser.close();
    } catch (err) {
      console.error("❌ puppeteer 오류:", err.message);
      return res.status(500).json({ error: "puppeteer 다운로드 실패" });
    }
    return;
  }

  // ▶️ yt-dlp 분기
  let args = [];
  if (platform === "youtube") {
    args = ["-f", "mp4", "-o", "-", videoUrl];
  } else if (platform === "tiktok") {
    args = ["--no-warnings", "-f", "mp4", "-o", "-", videoUrl];
  } else {
    console.error("[에러] 지원되지 않는 플랫폼:", platform);
    return res.status(400).json({ error: "지원되지 않는 플랫폼입니다." });
  }

  console.log("[yt-dlp 실행 인자]", args);

  const ytDlp = spawn("yt-dlp", args);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${platform}_video.mp4"`
  );
  res.setHeader("Content-Type", "video/mp4");

  ytDlp.stdout.pipe(res);

  ytDlp.stderr.on("data", (data) => {
    console.error("[yt-dlp STDERR]", data.toString());
  });

  ytDlp.on("error", (error) => {
    console.error("[yt-dlp 실행 실패]", error.message);
    res.status(500).json({ error: "다운로드 실패" });
  });

  ytDlp.on("close", (code) => {
    console.log(`[yt-dlp 종료] 코드: ${code}`);
    if (code !== 0) {
      console.error("[yt-dlp 종료] 실패");
    }
  });
});

module.exports = router;
