import { useCrawlStore } from "../stores/useCrawlStore";
import { useMutation } from "@tanstack/react-query";
import { crawlVideos } from "../api/crawl";
import VideoCard from "../components/VideoCard";
import Dashboard from "../components/Dashboard";
import SearchBar from "../components/SearchBar";
// 생략: import 구문
import { useState } from "react";

export default function Home() {
  const { videos, setVideos, isCrawled } = useCrawlStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0); // ✅ 진행률 상태 추가

  const [minViews, setMinViews] = useState(0);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const addLog = (msg) => {
    setLogs((prev) => {
      const updated = [...prev, msg];
      const totalExpectedLogs = 30; // ✅ 예측 로그 수 (채널 1~2개 기준으로 조정 가능)
      const percentage = Math.min(
        (updated.length / totalExpectedLogs) * 100,
        100
      );
      setProgress(percentage);
      return updated;
    });
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setLogs([]);
    setProgress(0);

    const res = await fetch("http://localhost:4000/api/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(Boolean);
      for (const line of lines) {
        if (line.startsWith("LOG:")) {
          addLog(line.replace("LOG:", "").trim());
        } else if (line.startsWith("RESULT:")) {
          try {
            const result = JSON.parse(line.replace("RESULT:", ""));
            setVideos(result);
          } catch (e) {
            addLog("❌ 결과 파싱 실패");
          }
        }
      }
    }

    setLoading(false);
  };

  const filterAndSortVideos = () => {
    const filtered = videos.filter((v) => {
      const isOverMinViews = v.platform !== "douyin" && v.views >= minViews;
      const isPlatformMatch =
        platformFilter === "all" || v.platform === platformFilter;
      return isOverMinViews && isPlatformMatch;
    });

    const sorted = [...filtered].sort((a, b) =>
      sortOrder === "desc" ? b.views - a.views : a.views - b.views
    );

    const douyinVideos = videos.filter((v) => v.platform === "douyin");
    return [...sorted, ...douyinVideos];
  };

  return (
    <div className="p-4 space-y-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border border-black p-2"
          value={minViews}
          onChange={(e) => setMinViews(Number(e.target.value))}
        >
          <option value={0}>전체</option>
          <option value={10000}>1만 이상</option>
          <option value={50000}>5만 이상</option>
          <option value={100000}>10만 이상</option>
          <option value={1000000}>100만 이상</option>
        </select>

        <select
          className="border border-black p-2"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
        >
          <option value="all">전체 플랫폼</option>
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="douyin">Douyin</option>
        </select>

        <select
          className="border border-black p-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">조회수 높은 순</option>
          <option value="asc">조회수 낮은 순</option>
        </select>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-60 mb-4" />
          <p className="text-white text-sm mb-2">🔥 크롤링 중입니다...</p>
          <div className="bg-white bg-opacity-20 w-64 h-2 rounded overflow-hidden mb-4">
            <div
              className="bg-green-300 h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-white text-xs max-h-[200px] overflow-y-auto px-4 w-full">
            {logs.map((log, i) => (
              <div key={i}>✅ {log}</div>
            ))}
          </div>
        </div>
      )}

      {isCrawled && (
        <div className="flex flex-col-reverse md:flex-row gap-6">
          <div className="flex-1 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filterAndSortVideos().map((v, index) => (
              <VideoCard
                key={`${v.platform}-${v.id || v.thumbnail}-${index}`}
                data={v}
              />
            ))}
          </div>
          <aside className="md:w-64 xl:w-130">
            <Dashboard />
          </aside>
        </div>
      )}
    </div>
  );
}
