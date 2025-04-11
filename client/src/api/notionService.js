// src/api/notionService.js
import axios from "axios";

export async function saveVideoToNotion({
  title,
  platform,
  url,
  thumbnail,
  memo,
  detailStrategy,
}) {
  const payload = {
    parent: { database_id: import.meta.env.VITE_NOTION_DATABASE_ID },
    properties: {
      썸네일: {
        files: [
          {
            type: "external",
            name: "thumbnail.jpg",
            external: {
              url: thumbnail, // 실제 유튜브 썸네일 URL
            },
          },
        ],
      },
      제목: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      플랫폼: {
        select: {
          name: platform === "youtube" ? "YouTube" : "TikTok", // 정제
        },
      },
      URL: {
        url,
      },
      전략: {
        rich_text: [
          {
            text: {
              content:
                detailStrategy?.st1
                  ?.map((v) => v["포지션"] || v["템플릿"] || "")
                  .filter(Boolean)
                  .join(" / ") || "없음",
            },
          },
        ],
      },
      Memo: {
        rich_text: [
          {
            text: {
              content: memo || "",
            },
          },
        ],
      },
    },
  };

  try {
    const res = await axios.post("http://localhost:4000/api/notion/", {
      data: payload,
    });
    console.log("✅ Notion 저장 성공:", res.data);
    alert("✅ Notion 저장 완료!");
  } catch (err) {
    console.error("❌ Notion 저장 실패:", err.response?.data || err.message);
    console.error(
      "❌ Notion API 실패:",
      JSON.stringify(err.response?.data, null, 2) || err.message
    );
  }
}
