require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 기본 전략 (수집 시)
async function generateStrategy(title, thumbnailUrl = "") {
  if (!title && !thumbnailUrl) return "";

  try {
    const messages = [
      {
        role: "system",
        content: `
You are a short-form content strategy expert trained with the curriculum of Digital Nomad Highclass.

💡 Your task:
Respond in Korean only. Write concise, clear, and actionable viral strategy for YouTube Shorts, TikTok, or Douyin.

📌 Output format (Korean):
1. 계획: ~
2. 후킹: ~
3. CTA: ~
4. 편집 아이디어: ~

❗Guidelines:
- 각 항목은 한 문장 이내로 요약
- 불필요한 설명, 도입, 마무리 금지
- 전체 답변은 3줄을 넘기지 않음
- 핵심 포인트만 전달 (no hashtags, no markdown, no 장문 설명)
`,
      },
    ];

    const userContent = [];

    if (title) {
      userContent.push({
        type: "text",
        text: `영상 제목: "${title}"`,
      });
    }

    if (
      thumbnailUrl &&
      !thumbnailUrl.includes(".webp") &&
      !thumbnailUrl.includes("douyinpic.com")
    ) {
      userContent.push({
        type: "image_url",
        image_url: { url: thumbnailUrl },
      });
    }

    userContent.push({
      type: "text",
      text: "이 영상의 바이럴 전략을 3줄로 요약해줘.",
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        ...messages,
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("❌ GPT 전략 생성 오류 (generateStrategy):", error.message);
    return "";
  }
}

// 상세 전략 (프롬프트 기반)
async function generateDetailStrategy({ title, thumbnail, memo, promptType }) {
  console.log("📥 요청 도착:", { title, memo, thumbnail, promptType });

  try {
    const introText = `제목: "${title}"\n메모: ${memo || "(없음)"}`;
    let userPrompt = "";

    if (promptType === "Serendipity Blend") {
      userPrompt = `
${introText}

당신은 주어진 주제에 전혀 관련 없는 키워드를 조합하여 창의적인 콘텐츠 전략을 도출하는 전문가입니다.
드론, 패션, 외계인 등 무작위 키워드를 주제와 결합해 새로운 전략을 2~3가지 제시하고, 각각 시뮬레이션한 결과와 시너지 효과도 언급해주세요.

응답은 다음 JSON 형식으로:
{
  "promptType": "Serendipity Blend",
  "1. 전략 요약": { ... },
  "2. 영상 기획 전략": { ... },
  "3. 태그 추천": [...],
  "4. 썸네일 문구": "...",
  "5. 멀티유즈 전략": "..."
}
`;
    } else if (promptType === "Emotive Narrative") {
      userPrompt = `
${introText}

당신은 감정 몰입형 콘텐츠 전략 전문가입니다. 이 영상 주제에 대해 3~5문장 내외의 몰입감 있는 짧은 스토리와 전략을 제시해주세요.

응답은 다음 JSON 형식으로:
{
  "promptType": "Emotive Narrative",
  "1. 전략 요약": { ... },
  "2. 영상 기획 전략": { ... },
  "3. 태그 추천": [...],
  "4. 썸네일 문구": "...",
  "5. 멀티유즈 전략": "..."
}
`;
    } else if (promptType === "Role Play Scenario") {
      userPrompt = `
${introText}

당신은 다양한 인물의 시점에서 영상 전략을 설계하는 역할극 콘텐츠 전문가입니다.
시청자, 전문가, 제작자의 역할로 각각 의견을 제시하고, 그 결과를 바탕으로 전략을 구성해주세요.

응답은 다음 JSON 형식으로:
{
  "promptType": "Role Play Scenario",
  "1. 전략 요약": { ... },
  "2. 영상 기획 전략": { ... },
  "3. 태그 추천": [...],
  "4. 썸네일 문구": "...",
  "5. 멀티유즈 전략": "..."
}
`;
    } else {
      throw new Error("❌ 지원되지 않는 프롬프트 유형입니다.");
    }

    const messages = [
      {
        role: "system",
        content:
          "당신은 고급 바이럴 콘텐츠 전략가입니다. JSON으로 명확하게 응답하세요.",
      },
      {
        role: "user",
        content: [{ type: "text", text: userPrompt }],
      },
    ];

    // ✅ base64 이미지만 포함 (data:image/... prefix 있는 경우만)
    if (thumbnail && thumbnail.startsWith("data:image/")) {
      console.log("🖼️ base64 이미지 포함됨");
      messages[1].content.push({
        type: "image_url",
        image_url: { url: thumbnail },
      });
    } else {
      console.warn("⚠️ base64 이미지 아님 → 이미지 제외:", thumbnail);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: "json", // 정확히 명시해야 함
      messages,
    });

    console.log("✅ GPT 응답 수신 완료");
    return response.choices[0].message.content;
  } catch (err) {
    console.error("❌ GPT 상세 전략 오류:", err.message);

    // fallback 전략: 텍스트 기반만 재시도
    try {
      const fallback = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "전략을 JSON 형식으로 간단히 요약해주세요.",
          },
          {
            role: "user",
            content: `제목: ${title}\n메모: ${memo}`,
          },
        ],
      });

      console.log("⚠️ fallback 전략 성공");
      return fallback.choices[0].message.content;
    } catch (fallbackErr) {
      console.error("❌ GPT fallback 전략도 실패:", fallbackErr.message);
      return null;
    }
  }
}

module.exports = {
  generateStrategy,
  generateDetailStrategy,
};
