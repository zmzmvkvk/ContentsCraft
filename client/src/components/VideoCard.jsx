import { useCrawlStore } from "../stores/useCrawlStore";
import youtubeIcon from "../assets/youtube.png";
import tiktokIcon from "../assets/tiktok.jpg";
import douyinIcon from "../assets/douyin.png";
import { useState } from "react";

export default function VideoCard({ data, type }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { liked, toggleLike, updateMemo, updateStrategy } = useCrawlStore();
  const isLiked = liked.some((v) => v.id === data.id);
  const [memoText, setMemoText] = useState(data.memo || "");
  const [selectedPrompt, setSelectedPrompt] = useState("Role Play Scenario");

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

  const handleSaveMemo = () => {
    alert("완료!");
    updateMemo(data.id, memoText);
  };

  const handleDetailAnalysis = async () => {
    if (!selectedPrompt || !data?.id) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch("http://localhost:4000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          thumbnail: data.thumbnail,
          memo: memoText,
          promptType: selectedPrompt,
          videoId: data.id,
        }),
      });

      const text = await res.text();

      // 비어있거나 HTML 응답이면 JSON 파싱 중단
      if (!text || text.startsWith("<")) {
        throw new Error("GPT 응답이 HTML 또는 빈 문자열입니다.");
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error("GPT 응답이 유효한 JSON이 아닙니다.");
      }

      if (!result || typeof result !== "object") {
        throw new Error("GPT 응답 비정상");
      }

      // ✅ Firebase에 저장
      updateStrategy(data.id, result);
      alert("🧠 전략 생성 완료!");
    } catch (err) {
      console.error("❌ GPT 분석 오류:", err);
      alert(`❌ GPT 응답 비정상입니다.\n${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="border-2 border-black bg-white rounded-xl overflow-hiddebn shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition duration-200 relative">
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="text-white text-sm bg-black px-4 py-2 rounded shadow">
            🧠 GPT 전략 분석 중...
          </div>
        </div>
      )}

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
            ? `${data.views.toLocaleString()} views`
            : `${data.likes?.toLocaleString() || "0"} likes`}{" "}
          • {data.platform}
        </p>
      </div>

      {/* 🧠 GPT 전략 영역 */}
      <div className="cursor-pointer transition-all duration-300 m-3 border border-gray-300 rounded-lg text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3">
        <strong className="block mb-1">🧠 GPT 전략</strong>
        {data.strategy ? (
          <div>
            <p>
              <strong>프롬프트:</strong> {data.strategy["promptType"]}
            </p>
            <p>
              <strong>전략 요약:</strong>{" "}
              {JSON.stringify(data.strategy["1. 전략 요약"], null, 2)}
            </p>
            <p>
              <strong>기획 전략:</strong>{" "}
              {JSON.stringify(data.strategy["2. 영상 기획 전략"], null, 2)}
            </p>
            <p>
              <strong>태그:</strong> {data.strategy["3. 태그 추천"]}
            </p>
            <p>
              <strong>썸네일 문구:</strong> {data.strategy["4. 썸네일 문구"]}
            </p>
            <p>
              <strong>멀티유즈 전략:</strong>{" "}
              {data.strategy["5. 멀티유즈 전략"]}
            </p>
          </div>
        ) : (
          "GPT 전략이 생성되지 않았습니다."
        )}
      </div>

      {/* 📌 최애탭 확장 영역 */}
      {isLiked && type === "favorite" && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
          >
            <option>Role Play Scenario</option>
            <option>Serendipity Blend</option>
            <option>Emotive Narrative</option>
          </select>

          <div className="flex gap-2">
            <textarea
              className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="내 전략 메모 작성..."
            />
            <button
              className="bg-orange-600 text-white px-3 text-sm font-semibold rounded"
              onClick={handleSaveMemo}
            >
              저장
            </button>
          </div>

          <button
            className="mt-1 w-full bg-black text-white py-2 rounded hover:bg-amber-600"
            onClick={handleDetailAnalysis}
          >
            🧠 상세 분석
          </button>
        </div>
      )}
    </div>
  );
}
