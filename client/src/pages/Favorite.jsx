import { useCrawlStore } from "../stores/useCrawlStore";
import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";

export default function Favorite() {
  const [minViews, setMinViews] = useState(0);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const { liked, syncFavorites } = useCrawlStore();

  const uniqueDates = [
    ...new Set(liked.map((item) => item.collectedAt?.slice(0, 10))),
  ].filter(Boolean);

  const isDateMatch = (video) => {
    if (!video.collectedAt) return true;
    const date = new Date(video.collectedAt);
    const now = new Date();

    if (dateFilter === "today") {
      return date.toDateString() === now.toDateString();
    }

    if (dateFilter === "week") {
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }

    if (dateFilter === "month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === "custom" && selectedDate) {
      return video.collectedAt?.startsWith(selectedDate);
    }

    return true;
  };

  const filterAndSortVideos = () => {
    const filtered = liked.filter((v) => {
      const isOverMinViews = v.platform !== "douyin" && v.views >= minViews;
      const isPlatformMatch =
        platformFilter === "all" || v.platform === platformFilter;
      const isDateValid = isDateMatch(v);
      return isOverMinViews && isPlatformMatch && isDateValid;
    });

    const sorted = [...filtered].sort((a, b) =>
      sortOrder === "desc" ? b.views - a.views : a.views - b.views
    );

    const douyinVideos = liked.filter((v) => v.platform === "douyin");
    return [...sorted, ...douyinVideos];
  };

  useEffect(() => {
    syncFavorites();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold mb-2">🫶 내가 좋아한 영상들</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border border-black p-2"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">전체 날짜</option>
          <option value="today">오늘</option>
          <option value="week">이번 주</option>
          <option value="month">이번 달</option>
          <option value="custom">날짜 선택</option>
        </select>

        {dateFilter === "custom" && (
          <select
            className="border border-black p-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">날짜 선택</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filterAndSortVideos().map((v, i) => (
          <VideoCard
            key={`${v.platform}-${v.id || v.thumbnail}-${i}`}
            data={v}
            type="favorite"
          />
        ))}
      </div>
    </div>
  );
}
