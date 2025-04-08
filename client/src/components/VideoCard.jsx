import { useState } from "react";
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
  // const [strategy, setStrategy] = useState(data.strategy || "");
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

  const handleDownload = async (platform, videoUrl) => {
    try {
      const response = await fetch("http://localhost:4000/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, videoUrl }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${platform}_video.mp4`;
      a.click();
    } catch (err) {
      console.error("다운로드 실패:", err);
    }
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
        // setStrategy(found.strategy || "");
        const ds = found.detailStrategy;
        const parsed = typeof ds === "string" ? JSON.parse(ds) : ds || {}; // 🔥 핵심!
        setDetailStrategy(parsed);
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

      {isFavorite && (
        <>
          <div className="m-3"></div>

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

          <div className="px-4 pb-4 flex gap-x-2 justify-between">
            <button
              className={`cursor-pointer rounded text-md py-1 px-2 text-white ${
                isSaving ? "bg-neutral-600" : "bg-gray-700 hover:bg-teal-600"
              }`}
              onClick={handleSaveMemo}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              className={`cursor-pointer rounded flex-auto text-md py-1 px-2 text-white ${
                isAnalyzing ? "bg-neutral-600" : "bg-gray-700 hover:bg-teal-600"
              }`}
              onClick={handleDetailAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : " Analyze"}
            </button>
            <button
              className="rounded cursor-pointer text-md flex-auto py-1 px-2 text-white bg-gray-700 hover:bg-teal-600"
              onClick={() => setShowStrategyModal(true)}
            >
              Detail
            </button>
            <button
              onClick={() => handleDownload(data.platform, data.url)}
              className="cursor-pointer rounded text-md py-1 px-2 bg-gray-700 text-white hover:bg-teal-600"
            >
              Download
            </button>
          </div>

          {showStrategyModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg">
                <h2 className="text-3xl font-bold mb-6">GPT 전략 상세 보기</h2>

                {detailStrategy ? (
                  <div className="space-y-6 text-[15px] text-gray-800 leading-relaxed">
                    {/* 전략 타입 */}
                    {detailStrategy.type && (
                      <p className="text-xl font-semibold">
                        {detailStrategy.type}
                      </p>
                    )}

                    {/* 각 전략 섹션 순서대로 */}
                    {["st1", "st2", "st3", "st4", "st5"].map((sectionKey) => {
                      const section = detailStrategy[sectionKey];
                      if (!section || !Array.isArray(section)) return null;

                      return (
                        <div key={sectionKey}>
                          {section
                            .sort((a, b) => a.idx - b.idx)
                            .map((item, idx) => {
                              const [labelKey, value] = Object.entries(
                                item
                              ).find(([key]) => key !== "idx");

                              // 🎯 제목
                              if (labelKey === "title") {
                                return (
                                  <p
                                    key={idx}
                                    className="text-lg font-bold mt-4 mb-2 border-b border-black pb-1"
                                  >
                                    {value}
                                  </p>
                                );
                              }

                              // 기승전결 분리
                              if (
                                labelKey === "기승전결 스토리" &&
                                typeof value === "object"
                              ) {
                                return (
                                  <div key={idx} className="ml-2 space-y-1">
                                    {["기", "승", "전", "결"].map((part) => (
                                      <div key={part}>
                                        <span className="font-bold">
                                          {part}:
                                        </span>{" "}
                                        {value[part] || "-"}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }

                              // 배열 항목들 (태그, 문구, 전략 등)
                              if (Array.isArray(value)) {
                                return (
                                  <div key={idx} className="ml-2">
                                    <span className="font-medium text-gray-700">
                                      {labelKey}:
                                    </span>
                                    <ul className="list-disc ml-6 text-gray-800">
                                      {value.map((v, i) => (
                                        <li key={i}>{v}</li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              }

                              // 나머지 일반 문자열
                              return (
                                <div key={idx} className="ml-2">
                                  <span className="font-medium text-gray-700">
                                    {labelKey}:
                                  </span>{" "}
                                  {value}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">아직 생성된 전략이 없습니다.</p>
                )}

                <div className="mt-6 text-right">
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
      )}
    </div>
  );
}
