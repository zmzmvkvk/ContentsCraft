// src/pages/Home.jsx
import { useCrawlStore } from "../stores/useCrawlStore";
import { useMutation } from "@tanstack/react-query";
import { crawlVideos } from "../api/crawl";
import { useState } from "react";
import VideoCard from "../components/VideoCard";
import Dashboard from "../components/Dashboard";
import SearchBar from "../components/searchBar";

export default function Home() {
  const { videos, setVideos, isCrawled } = useCrawlStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const crawlMutation = useMutation({
    mutationFn: crawlVideos,
    onSuccess: (data) => {
      setVideos(data);
    },
    onError: (err) => {
      alert("크롤링 실패: " + err.message);
    },
    onSettled: () => setLoading(false),
  });

  // const handleSearch = () => {
  //   if (!query.trim()) return;
  //   setLoading(true);
  //   crawlMutation.mutate({ keyword: query });
  // };

  const handleSearch = () => {
    if (!query.trim()) return;

    const mock = [
      {
        id: "abc123",
        title: "🔥 터질 영상 테스트",
        thumbnail: "https://via.placeholder.com/320x180.png?text=Thumbnail",
        views: 3200000,
        platform: "youtube",
        uploadedAt: "2025-03-30",
        url: "https://youtube.com/watch?v=abc123",
      },
      {
        id: "xyz456",
        title: "🚀 초급등 영상",
        thumbnail: "https://via.placeholder.com/320x180.png?text=Thumbnail+2",
        views: 5100000,
        platform: "tiktok",
        uploadedAt: "2025-03-29",
        url: "https://tiktok.com/abc",
      },
    ];

    setVideos(mock);
  };

  return (
    <div className="p-4 space-y-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        loading={loading}
      />
      {isCrawled && (
        <>
          <div className="flex flex-col-reverse md:flex-row gap-6">
            <div className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <VideoCard key={v.id} data={v} />
              ))}
            </div>

            <aside className="md:w-64">
              <Dashboard />
            </aside>
          </div>
        </>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-60 mb-4"></div>
          <p className="text-white text-sm">
            🔥 크롤링 중입니다... (예상 완료: 약 7초)
          </p>
          <div className="w-64 h-2 bg-white bg-opacity-20 mt-4 rounded">
            <div
              className="h-2 bg-green-300 rounded animate-pulse"
              style={{ width: "40%" }} // 나중에 state로 제어 가능
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
