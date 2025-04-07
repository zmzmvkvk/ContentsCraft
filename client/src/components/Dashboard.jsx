import { useCrawlStore } from "../stores/useCrawlStore";
import PlatformBarChart from "./charts/PlatformBarChart";
import ViewsDonutChart from "./charts/ViewsDonutChart";
import KeywordFrequencyChart from "./charts/KeywordFrequencyChart";

export default function Dashboard() {
  const { videos, liked } = useCrawlStore();

  const countByPlatform = videos.reduce((acc, v) => {
    acc[v.platform] = (acc[v.platform] || 0) + 1;
    return acc;
  }, {});

  const mostViewed = [...videos].sort((a, b) => b.views - a.views)[0];

  const avgByPlatform = {};
  for (const platform of ["youtube", "tiktok", "douyin"]) {
    const pv = videos.filter((v) => v.platform === platform);
    avgByPlatform[platform] = pv.length
      ? Math.round(pv.reduce((sum, v) => sum + (v.views || 0), 0) / pv.length)
      : 0;
  }

  return (
    <div className="border-2 border-black p-4 rounded-xl bg-[#f3f2ee] shadow-[4px_4px_0px_#000] text-sm xl:text-[15px] space-y-2">
      <h2 className="font-bold text-lg xl:text-xl mb-2">📊 대시보드</h2>

      <p>
        총 수집 영상: <strong>{videos.length}</strong>개
      </p>
      <p>
        👍 좋아요한 영상: <strong>{liked.length}</strong>개
      </p>

      <hr className="my-2 border-black" />

      <p>• 플랫폼별 영상 수:</p>
      {Object.entries(countByPlatform).map(([platform, count]) => (
        <p key={platform} className="ml-2">
          ▸ {platform}: {count ? count.toLocaleString() : "0"}개
        </p>
      ))}

      <p>• 플랫폼별 평균 조회수:</p>
      {Object.entries(avgByPlatform).map(([platform, avg]) => (
        <p key={platform} className="ml-2">
          ▸ {platform}: {avg ? avg.toLocaleString() : "0"} views
        </p>
      ))}

      <hr className="my-2 border-black" />

      {mostViewed && (
        <div>
          <p>🔥 가장 높은 조회수 영상:</p>
          <p className="text-xs italic">
            “{mostViewed.title}”<br />(
            {mostViewed.views ? mostViewed.views.toLocaleString() : "0"} views)
          </p>
        </div>
      )}

      <PlatformBarChart />
      <ViewsDonutChart />
      <KeywordFrequencyChart />
      <p className="text-[11px] xl:text-xs text-gray-500 mt-2">
        마지막 수집 시간: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
