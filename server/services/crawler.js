const crawlYouTube = require("./youtube");
const crawlTikTok = require("./tiktok");
const crawlDouyin = require("./douyin");
const { generateStrategy } = require("./strategy");

module.exports = async function crawlAllPlatforms(input, options = {}) {
  const { onLog = () => {} } = options;
  const pLimit = (await import("p-limit")).default;
  const limit = pLimit(3); // 🔥 최대 동시 실행 3개로 제한

  const channels = input
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 50);

  onLog(`🚀 총 ${channels.length}개 채널 수집 시작`);

  // 🔁 수집 작업을 limit 내에서 병렬 처리
  const crawlingTasks = channels.map((channelName) =>
    limit(async () => {
      try {
        onLog(`📡 ${channelName} 수집 중...`);
        const yt = await crawlYouTube(channelName);
        const tk = await crawlTikTok(channelName);
        const dy = await crawlDouyin(channelName);
        const all = [...yt, ...tk, ...dy];
        onLog(`✅ ${channelName} 수집 성공 (${all.length}개)`);
        return all;
      } catch (err) {
        onLog(`❌ ${channelName} 수집 실패: ${err.message}`);
        return [];
      }
    })
  );

  const results = await Promise.all(crawlingTasks);
  const validResults = results.flat();

  onLog(`✅ 크롤링 완료: ${validResults.length}개 영상`);

  // 🧠 전략 생성도 limit 내에서 병렬 처리
  const strategyTasks = validResults.map((video, i) =>
    limit(async () => {
      if (video.title) {
        onLog(`🤖 GPT 전략 생성 중 (${i + 1}/${validResults.length})`);
        const strategy = await generateStrategy(video.title, video.thumbnail);
        return { ...video, strategy };
      }
      return video;
    })
  );

  const withStrategy = await Promise.all(strategyTasks);

  onLog(`✅ 모든 전략 생성 완료`);
  return withStrategy;
};
