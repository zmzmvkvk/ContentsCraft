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
import { fetchPixabayImages } from "../api/resource";
import { saveVideoToNotion } from "../api/notionService";

export default function VideoCard({ data, type }) {
  const [memo, setMemo] = useState(data.memo || "");
  const [detailStrategy, setDetailStrategy] = useState(
    data.detailStrategy || ""
  );
  const [selectedPrompt, setSelectedPrompt] = useState("Factual Insight");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const { liked, toggleLike } = useCrawlStore();
  const isLiked = liked.some((v) => v.id === data.id);
  const isFavorite = type === "favorite";

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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
        headers: { "Content-Type": "application/json" },
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
        const ds = found.detailStrategy;
        const parsed = typeof ds === "string" ? JSON.parse(ds) : ds || {};
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
    <div className="border border-gray-700 bg-[#2a2a2a] text-white rounded-xl overflow-hidden shadow-md relative">
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        <img
          src={getPlatformIcon(data.platform)}
          alt={data.platform}
          className="w-6 h-6 rounded-sm border border-white bg-white"
        />
        <button
          className={`px-2 py-1 rounded-full text-sm font-bold border-2 border-white ${
            isLiked ? "bg-yellow-300 text-black" : "bg-transparent text-white"
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
        <p className="text-xs text-white mb-1">
          수집일: {formatDate(data.collectedAt)}
        </p>
        <p className="text-xs text-white mb-2">
          {data.platform !== "douyin"
            ? `${data.views?.toLocaleString() || "0"} views`
            : `${data.likes?.toLocaleString() || "0"} likes`}{" "}
          • {data.platform}
        </p>
      </div>

      {isFavorite && (
        <>
          <div className="px-4 pb-2">
            <select
              className="w-full border border-gray-600 bg-[#2c2c2c] text-white rounded-md p-2 text-sm mb-2"
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
            >
              <option value="Role Play Scenario">역할극 시나리오</option>
              <option value="Serendipity Blend">무작위 키워드 결합</option>
              <option value="Emotive Narrative">감정·스토리 몰입</option>
              <option value="Factual Insight">사실기반 정보</option>
            </select>
            <textarea
              className="w-full border border-gray-600 bg-[#2c2c2c] text-white rounded-md p-2 text-sm mb-2"
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="내 전략 메모 작성..."
              disabled={isSaving || isAnalyzing}
            />
          </div>

          <div className="px-4 pb-4 flex flex-wrap gap-2">
            <button
              className={`rounded px-4 py-2 text-sm font-semibold ${
                isSaving ? "bg-gray-600" : "bg-gray-700 hover:bg-blue-500"
              } text-white`}
              onClick={handleSaveMemo}
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "메모 저장"}
            </button>
            <button
              className={`flex-auto rounded px-4 py-2 text-sm font-semibold ${
                isAnalyzing ? "bg-gray-600" : "bg-gray-700 hover:bg-blue-500"
              } text-white`}
              onClick={handleDetailAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "분석 중..." : "GPT 전략 분석"}
            </button>
            <button
              className="flex-auto rounded px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-blue-500 text-white"
              onClick={() => setShowStrategyModal(true)}
            >
              전략 보기
            </button>
            <button
              onClick={() => handleDownload(data.platform, data.url)}
              className="flex-auto rounded px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-blue-500 text-white"
            >
              다운로드
            </button>
            <button
              onClick={() =>
                saveVideoToNotion({ ...data, memo, detailStrategy })
              }
              className="flex-auto rounded px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-blue-500 text-white"
            >
              📝 Notion 저장
            </button>
          </div>

          {showStrategyModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-[#2a2a2a] text-white p-6 rounded-xl w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg">
                <h2 className="text-3xl font-bold mb-6">GPT 전략 상세 보기</h2>
                {detailStrategy ? (
                  <div className="space-y-6 text-[15px] text-white leading-relaxed">
                    {detailStrategy.type && (
                      <p className="text-xl font-semibold">
                        {detailStrategy.type}
                      </p>
                    )}

                    {["st1", "st2", "st3", "st4", "st5", "st6"].map(
                      (sectionKey) => {
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

                                if (labelKey === "title") {
                                  return (
                                    <p
                                      key={idx}
                                      className="text-lg font-bold mt-4 mb-2 border-b border-white pb-1"
                                    >
                                      {value}
                                    </p>
                                  );
                                }

                                if (
                                  [
                                    "도입",
                                    "갈등",
                                    "전개",
                                    "전환",
                                    "해결",
                                  ].includes(item?.seq || "")
                                ) {
                                  return (
                                    <div
                                      key={idx}
                                      className="ml-4 mb-4 p-3 rounded bg-gray-700"
                                    >
                                      <p className="text-sm font-semibold mb-1">
                                        🎬{" "}
                                        <span className="text-blue-300">
                                          {item.seq}
                                        </span>
                                      </p>
                                      <p className="mb-1">
                                        📝 <strong>스크립트:</strong>{" "}
                                        {item.script}
                                      </p>
                                      <p className="mb-1">
                                        🎯 <strong>공략 요소:</strong>{" "}
                                        {Array.isArray(item.factor)
                                          ? item.factor.join(", ")
                                          : "-"}
                                      </p>
                                      <p className="mb-1">
                                        👀 <strong>타깃:</strong>{" "}
                                        {item.target || "-"}
                                      </p>
                                      <p className="text-sm font-semibold mt-2 mb-1">
                                        ✅ 리소스 추천
                                      </p>
                                      {item.clip_recommendation && (
                                        <div className="mb-1">
                                          🎬 <strong>영상 리소스:</strong>
                                          <ul className="list-disc ml-6">
                                            {item.clip_recommendation.map(
                                              (v, i) => (
                                                <li key={i}>{v}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                      {item.bgm_suggestion && (
                                        <div className="mb-1">
                                          🗣️ <strong>BGM:</strong>{" "}
                                          {item.bgm_suggestion}
                                        </div>
                                      )}
                                      {item.image_reference && (
                                        <div className="mb-1">
                                          🖼️ <strong>이미지:</strong>
                                          <ul className="list-disc ml-6 mb-2">
                                            {item.image_reference.map(
                                              (v, i) => (
                                                <li key={i}>{v}</li>
                                              )
                                            )}
                                          </ul>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {item.image_reference.map(
                                              (query, i) => (
                                                <ImageFetcher
                                                  key={i}
                                                  query={query}
                                                />
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

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

                                if (Array.isArray(value)) {
                                  return (
                                    <div key={idx} className="ml-2">
                                      <span className="font-medium text-neutral-300">
                                        {labelKey}:
                                      </span>
                                      <ul className="list-disc ml-6">
                                        {value.map((v, i) => (
                                          <li key={i}>{v}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={idx} className="ml-2">
                                    <span className="font-medium text-neutral-300">
                                      {labelKey}:
                                    </span>{" "}
                                    {value}
                                  </div>
                                );
                              })}

                            {sectionKey === "st6" && (
                              <div className="text-right mt-4">
                                <button
                                  onClick={() => {
                                    const header = `당신은 유튜브 스토리텔링 전문가입니다.
                                        아래의 구성을 참고하여, 60초 이내의 완성도 높은 숏폼 대본을 제작해주세요.

                                        목표:
                                        - 기획 의도와 연출 요소를 고려해 시청자의 이탈을 방지하고,
                                        - 감정 몰입 요소와 CTA를 포함한 구조적 스토리로 설득력 있게 구성해주세요.\n`;
                                    const scriptTexts = section
                                      .filter((item) => item?.script)
                                      .map((item) => {
                                        const clip =
                                          item.clip_recommendation
                                            ?.map((c) => `- ${c}`)
                                            .join("\n") || "-";
                                        const image =
                                          item.image_reference
                                            ?.map((c) => `- ${c}`)
                                            .join("\n") || "-";
                                        return `🎬 ${item.seq}
                                        📝 스크립트: ${item.script}
                                        🎯 공략 요소: ${
                                          Array.isArray(item.factor)
                                            ? item.factor.join(", ")
                                            : "-"
                                        }
                                        👀 타깃: ${item.target || "-"}
                                        ✅ 리소스 추천
                                        🎬 영상 리소스:
                                        ${clip}
                                        🗣️ BGM: ${item.bgm_suggestion || "-"}
                                        🖼️ 이미지:
                                        ${image}
                                        `;
                                      })
                                      .join("\n");

                                    const result = `${header}\n${scriptTexts}\n 이 대본을 기준으로 한글로 실제 영상 컷 구성표, 자막 타이밍, TTS 버전을 만들어주세요.`;
                                    navigator.clipboard.writeText(result);
                                    alert(
                                      "📋 프롬프트용 대본이 복사되었습니다!"
                                    );
                                  }}
                                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  프롬프트용 대본 복사
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-400">
                    아직 생성된 전략이 없습니다.
                  </p>
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
      {(isAnalyzing || isSaving) && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function ImageFetcher({ query }) {
  const [pixabay, setPixabay] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pixabayRes] = await Promise.all([fetchPixabayImages(query)]);
        setPixabay(pixabayRes);
      } catch (err) {
        console.error("이미지 로딩 실패:", err.message);
      }
    };
    load();
  }, [query]);

  return (
    <>
      {pixabay.slice(0, 2).map((img) => (
        <img
          key={`pixabay-${img.id}`}
          src={img.url}
          alt={img.tags}
          className="rounded shadow w-full object-cover"
        />
      ))}
    </>
  );
}
