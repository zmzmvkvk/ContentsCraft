const crawlYouTube = require("./youtube");
const crawlTikTok = require("./tiktok");
const crawlDouyin = require("./douyin");
const { generateStrategy } = require("./strategy"); // 🧠 전략 생성 추가

module.exports = async function crawlAllPlatforms(input, options = {}) {
  const { onLog = () => {} } = options;

  const channels = input
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 50); // 최대 50개

  onLog(`🚀 총 ${channels.length}개 채널 수집 시작`);

  const allResults = await Promise.allSettled(
    channels.flatMap((channelName) => [
      crawlYouTube(channelName),
      crawlTikTok(channelName),
      crawlDouyin(channelName),
    ])
  );

  const validResults = allResults
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value);

  onLog(`✅ 크롤링 완료: ${validResults.length}개 영상`);

  // 🧠 GPT 전략 생성 추가
  const withStrategy = await Promise.all(
    validResults.map(async (video, i) => {
      if (video.title) {
        onLog?.(`🤖 GPT 전략 생성 중 (${i + 1}/${validResults.length})`);
        const strategy = await generateStrategy(video.title, video.thumbnail);
        return { ...video, strategy };
      }
      return video;
    })
  );

  onLog(`✅ 모든 전략 생성 완료`);
  return withStrategy;
};
