// src/pages/Favorite.jsx
import { useCrawlStore } from "../stores/useCrawlStore";
import VideoCard from "../components/VideoCard";

export default function Favorite() {
  const { liked } = useCrawlStore();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">❤️ 좋아요 누른 영상</h1>
      {liked.length === 0 ? (
        <p className="text-gray-500">아직 좋아요 누른 영상이 없습니다.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {liked.map((v) => (
            <VideoCard key={v.id} data={v} />
          ))}
        </div>
      )}
    </div>
  );
}
