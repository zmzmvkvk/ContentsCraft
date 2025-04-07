import { useEffect, useState } from "react";
import youtubeIcon from "../assets/youtube.png";
import tiktokIcon from "../assets/tiktok.jpg";
import douyinIcon from "../assets/douyin.png";
import {
  updateFavoriteMemo,
  updateFavoriteStrategy,
  fetchFavoritesFromDB,
} from "../api/firebaseService";
import { useCrawlStore } from "../stores/useCrawlStore";

export default function VideoCard({ data, type }) {
  const [memo, setMemo] = useState(data.memo || "");
  const [strategy, setStrategy] = useState(data.strategy || "");
  const [detailStrategy, setDetailStrategy] = useState(
    data.detailStrategy || ""
  );
  const [selectedPrompt, setSelectedPrompt] = useState("Role Play Scenario");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const { liked, toggleLike } = useCrawlStore();
  const isLiked = liked.some((v) => v.id === data.id);
  const isFavorite = type === "favorite";

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

  const handleSaveMemo = async () => {
    setIsSaving(true);
    await updateFavoriteMemo(data.id, memo);
    const updated = await fetchFavoritesFromDB();
    const found = updated.find((v) => v.id === data.id);
    if (found) setMemo(found.memo || "");
    setIsSaving(false);
  };

  const handleDetailAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: data.id,
          title: data.title,
          memo,
          promptType: selectedPrompt,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result) throw new Error("응답 비정상");
      await updateFavoriteStrategy(data.id, { detailStrategy: result });
      const updated = await fetchFavoritesFromDB();
      const found = updated.find((v) => v.id === data.id);
      if (found) {
        setStrategy(found.strategy || "");
        setDetailStrategy(found.detailStrategy || "");
      }
    } catch (err) {
      console.error("❌ GPT 분석 오류:", err);
      alert("❌ GPT 응답이 비정상입니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="border-2 border-black bg-white rounded-xl overflow-hidden shadow-[4px_4px_0px_#000] relative">
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

      <a href={data.url} target="_blank" rel="noopener noreferrer">
        <img
          src={data.thumbnail}
          alt={data.title}
          className="w-full h-48 object-cover hover:opacity-80 transition"
        />
      </a>

      <div className="p-3">
        <h2 className="font-semibold text-base mb-1">{data.title}</h2>
        <p className="text-xs text-gray-600 mb-2">
          {data.platform !== "douyin"
            ? `${data.views?.toLocaleString() || "0"} views`
            : `${data.likes?.toLocaleString() || "0"} likes`}{" "}
          • {data.platform}
        </p>
      </div>

      {isFavorite ? (
        <>
          <div className="m-3">
            <strong className="block mb-1">🧠 GPT 전략</strong>
            <button
              className="text-blue-600 underline text-sm"
              onClick={() => setShowStrategyModal(true)}
            >
              전략 자세히 보기
            </button>
          </div>

          <div className="px-4 pb-2">
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm mb-2"
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
            >
              <option value="Role Play Scenario">
                역할극(Role Play) 시나리오
              </option>
              <option value="Serendipity Blend">
                무작위 키워드 결합(Serendipity Blend)
              </option>
              <option value="Emotive Narrative">
                감정·스토리 몰입(Emotive Narrative)
              </option>
            </select>

            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm mb-2"
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="내 전략 메모 작성..."
              disabled={isSaving || isAnalyzing}
            />
          </div>

          <div className="px-4 pb-4 flex justify-between">
            <button
              className={`px-4 py-1 rounded text-white text-sm ${
                isSaving ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
              }`}
              onClick={handleSaveMemo}
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>

            <button
              className={`w-4/5 py-2 rounded text-white text-sm font-bold ${
                isAnalyzing ? "bg-gray-600" : "bg-black hover:bg-neutral-800"
              }`}
              onClick={handleDetailAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "🧠 GPT 전략 분석 중..." : "🧠 상세 분석"}
            </button>
          </div>

          {showStrategyModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-auto shadow-lg">
                <h2 className="text-3xl font-bold mb-4">
                  🧠 GPT 전략 상세 보기
                </h2>
                {detailStrategy ? (
                  selectedPrompt === "Serendipity Blend" ? (
                    <div className="space-y-6 text-[15px] text-gray-800 leading-relaxed">
                      <h3 className="text-lg font-bold">
                        🔀 무작위 결합 아이디어
                      </h3>
                      {Array.isArray(detailStrategy["무작위 결합 아이디어"]) ? (
                        detailStrategy["무작위 결합 아이디어"].map(
                          (idea, index) => (
                            <div key={index} className="space-y-2">
                              <p className="font-semibold">
                                {index + 1}. {idea.조합명}
                              </p>
                              <p>👉 {idea.설명}</p>
                              <ul className="list-disc list-inside text-sm ml-2 text-gray-700">
                                <li>📌 예시: {idea.예시}</li>
                                <li>✨ 효과: {idea.효과}</li>
                              </ul>
                            </div>
                          )
                        )
                      ) : (
                        <p>아이디어 없음</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 text-lg text-gray-800">
                      <div>
                        <p className="font-semibold text-base">1. 전략 요약</p>
                        {Object.entries(
                          detailStrategy["1. 전략 요약"] || {}
                        ).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key}:</strong> {value}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold text-base">
                          2. 영상 기획 전략
                        </p>
                        {Object.entries(
                          detailStrategy["2. 영상 기획 전략"] || {}
                        ).map(([key, value]) => (
                          <p key={key}>
                            <strong>{key}:</strong> {value}
                          </p>
                        ))}
                      </div>
                      <p>
                        <strong>3. 태그 추천:</strong>{" "}
                        {detailStrategy["3. 태그 추천"]?.join(", ") || "없음"}
                      </p>
                      <p>
                        <strong>4. 썸네일 문구:</strong>{" "}
                        {detailStrategy["4. 썸네일 문구"] || "없음"}
                      </p>
                      <p>
                        <strong>5. 멀티유즈 전략:</strong>{" "}
                        {detailStrategy["5. 멀티유즈 전략"] || "없음"}
                      </p>
                    </div>
                  )
                ) : (
                  <p className="text-gray-500">
                    🧠 아직 생성된 전략이 없습니다.
                  </p>
                )}
                <div className="mt-4 text-right">
                  <button
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    onClick={() => setShowStrategyModal(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="m-3">
          <strong className="block mb-1">🧠 GPT 전략</strong>
          {data.strategy}
        </div>
      )}
    </div>
  );
}
