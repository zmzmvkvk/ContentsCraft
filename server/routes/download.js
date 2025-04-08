const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

router.post("/", async (req, res) => {
  const { platform, videoUrl } = req.body;

  console.log("[요청 수신]", { platform, videoUrl });

  let args = [];

  if (platform === "youtube") {
    args = ["-f", "mp4", "-o", "-", videoUrl];
  } else if (platform === "tiktok") {
    args = ["--no-warnings", "-f", "mp4", "-o", "-", videoUrl];
  } else if (platform === "douyin") {
    args = [
      "--referer",
      "https://www.douyin.com/",
      "-f",
      "mp4",
      "-o",
      "-",
      videoUrl,
    ];
  } else {
    console.error("[에러] 지원되지 않는 플랫폼");
    return res.status(400).json({ error: "지원되지 않는 플랫폼입니다." });
  }

  console.log("[yt-dlp 실행 인자]", args);

  const ytDlp = spawn("yt-dlp", args);

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${platform}_video.mp4"`
  );
  res.setHeader("Content-Type", "video/mp4");

  ytDlp.stdout.pipe(res); // 영상 스트리밍 전달

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
