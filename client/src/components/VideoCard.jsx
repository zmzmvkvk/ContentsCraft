import { useCrawlStore } from "../stores/useCrawlStore";
import youtubeIcon from "../assets/youtube.png";
import tiktokIcon from "../assets/tiktok.jpg";
import douyinIcon from "../assets/douyin.png";
import { useState } from "react";

export default function VideoCard({ data }) {
  const { liked, toggleLike } = useCrawlStore();
  const isLiked = liked.some((v) => v.id === data.id);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "youtube":
        return youtubeIcon;
      case "tiktok":
        return tiktokIcon;
      case "douyin":
        return douyinIcon;
      default:
        return null;
    }
  };

  return (
    <div className="border-2 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition duration-200 relative">
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        <img
          src={getPlatformIcon(data.platform)}
          alt={data.platform}
          className="w-6 h-6 rounded-sm border border-black bg-white"
        />
        <button
          className={`px-2 py-1 rounded-full text-sm font-bold border-2 border-black ${
            isLiked ? "bg-yellow-300 text-black" : "bg-white text-black"
          }`}
          onClick={() => toggleLike(data)}
        >
          {isLiked ? "👍" : "최애"}
        </button>
      </div>

      {/* ✅ 썸네일 클릭시 이동 + hover 효과 */}
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-full h-48 object-cover group-hover:opacity-80 transition"
        />
      </a>

      <div className="p-3">
        <h2 className="font-semibold text-base mb-1">{data.title}</h2>
        <p className="text-xs text-gray-600 mb-2">
          {data.platform !== "douyin"
            ? `${data.views.toLocaleString()} views`
            : `${data.likes?.toLocaleString() || "0"} likes`}{" "}
          • {data.platform}
        </p>
      </div>

      {/* 🧠 GPT 전략 영역 */}
      <div
        className={`cursor-pointer transition-all duration-300 m-3 border border-gray-300 rounded-lg text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3`}
      >
        <strong className="block mb-1">GPT 전략</strong>
        {data.strategy || "GPT 전략이 생성되지 않았습니다."}
      </div>
    </div>
  );
}
