const crawlYouTube = require("./youtube");
const crawlTikTok = require("./tiktok");
const crawlDouyin = require("./douyin");

module.exports = async function crawlAllPlatforms(keyword) {
  const [yt, tt, dy] = await Promise.all([
    crawlYouTube(keyword),
    crawlTikTok(keyword),
    crawlDouyin(keyword),
  ]);

  return [...yt, ...tt, ...dy]; // 하나의 통합 리스트로 반환
};
