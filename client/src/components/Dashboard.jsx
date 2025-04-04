import { useCrawlStore } from "../stores/useCrawlStore";

export default function Dashboard() {
  const { videos, liked } = useCrawlStore();

  const countByPlatform = videos.reduce((acc, v) => {
    acc[v.platform] = (acc[v.platform] || 0) + 1;
    return acc;
  }, {});

  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const avgViews = videos.length ? Math.round(totalViews / videos.length) : 0;

  const mostViewed = [...videos].sort((a, b) => b.views - a.views)[0];

  return (
    <div className="border-2 border-black p-4 rounded-xl bg-[#f3f2ee] shadow-[4px_4px_0px_#000] text-sm xl:text-lg  space-y-2">
      <h2 className="font-bold text-lg xl:text-2xl mb-2">📊 대시보드</h2>

      <p>
        총 수집 영상: <strong>{videos.length}</strong>개
      </p>
      {Object.entries(countByPlatform).map(([platform, count]) => (
        <p key={platform}>
          • {platform}: {count}개
        </p>
      ))}

      <hr className="my-2 border-black" />

      <p>
        👍 좋아요한 영상: <strong>{liked.length}</strong>개
      </p>
      <p>
        📈 평균 조회수: <strong>{avgViews.toLocaleString()}</strong>
      </p>

      {mostViewed && (
        <div>
          <p>🔥 가장 높은 조회수 영상:</p>
          <p className="text-xs xl:text-md italic">
            “{mostViewed.title}”<br />({mostViewed.views.toLocaleString()}{" "}
            views)
          </p>
        </div>
      )}

      <hr className="my-2 border-black" />

      <p className="text-[11px] xl:text-md text-gray-500">
        마지막 수집 시간: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
}
