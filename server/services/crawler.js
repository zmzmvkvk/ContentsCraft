const crawlYouTube = require("./youtube");
const crawlTikTok = require("./tiktok");
const crawlDouyin = require("./douyin");

module.exports = async function crawlAllPlatforms(input, options = {}) {
  const { onLog = () => {} } = options;
  const pLimit = (await import("p-limit")).default;
  const limit = pLimit(5); // 🔥 최대 동시 실행 5개로 제한

  const channels = input
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 100);

  onLog(`🚀 총 ${channels.length}개 채널 수집 시작`);

  // 🔁 수집 작업을 limit 내에서 병렬 처리
  const crawlingTasks = channels.map((channelName) =>
    limit(async () => {
      try {
        onLog(`📡 ${channelName} 수집 중...`);
        const yt = await crawlYouTube(channelName);
        const tk = await crawlTikTok(channelName);
        const all = [...yt, ...tk];
        // const dy = await crawlDouyin(channelName);
        // const all = [...yt, ...tk, ...dy];
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
  return validResults;
};
