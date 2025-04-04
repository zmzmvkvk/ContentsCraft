const crawlYouTube = require("./youtube");
const crawlTikTok = require("./tiktok");
const crawlDouyin = require("./douyin");

module.exports = async function crawlAllPlatforms(input) {
  const channels = input
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 50); // 최대 50개

  console.log(`🚀 총 ${channels.length}개 채널 수집 시작`);

  const results = await Promise.allSettled(
    channels.flatMap((channelName) => [
      crawlYouTube(channelName),
      crawlTikTok(channelName),
      crawlDouyin(channelName),
    ])
  );

  const validResults = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  console.log(`✅ 크롤링 완료: ${validResults.length}개 영상 수집됨`);
  return validResults;
};
