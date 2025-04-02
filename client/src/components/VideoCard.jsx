import { useCrawlStore } from "../stores/useCrawlStore";

export default function VideoCard({ data }) {
  const { liked, toggleLike } = useCrawlStore();

  const isLiked = liked.some((v) => v.id === data.id);

  return (
    <div className="border-2 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition duration-200 relative">
      <img
        src={data.thumbnail}
        alt={data.title}
        className="w-full h-48 object-cover"
      />

      <button
        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-bold border-2 border-black ${
          isLiked ? "bg-yellow-300 text-black" : "bg-white text-black"
        }`}
        onClick={() => toggleLike(data)}
      >
        {isLiked ? "🫶" : "👍"}
      </button>

      <div className="p-3">
        <h2 className="font-semibold text-base mb-1">{data.title}</h2>
        <p className="text-xs text-gray-600 mb-2">
          {data.views.toLocaleString()} views • {data.platform}
        </p>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline text-blue-700"
        >
          영상 보기 →
        </a>
      </div>
    </div>
  );
}
