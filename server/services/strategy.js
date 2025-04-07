require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 간단 전략 생성 (기존용 - 수정하지 말기)
async function generateStrategy(title) {
  if (!title) return "";

  try {
    const messages = [
      {
        role: "system",
        content: `
You are a short-form content strategy expert trained with the curriculum of Digital Nomad Highclass.
Respond in Korean only. Write concise, clear, and actionable viral strategy.

📌 Output:
1. 계획: ~
2. 후킹: ~
3. CTA: ~
4. 편집 아이디어: ~

❗Guidelines:
- 한 문장씩, 총 3~4줄로 작성
- 설명 없이 핵심만 전달
        `,
      },
      {
        role: "user",
        content: `영상 제목: "${title}"\n이 영상의 바이럴 전략을 요약해줘.`,
      },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return res.choices[0].message.content;
  } catch (err) {
    console.error("❌ 간단 전략 생성 오류:", err.message);
    return null;
  }
}

// 상세 전략 생성
async function generateDetailStrategy({ title, memo, promptType }) {
  if (!title || !promptType) throw new Error("title, promptType는 필수입니다.");

  const intro = `제목: "${title}"\n메모: ${memo || "(없음)"}`;
  let userPrompt = "";
  let fallbackPrompt = "";

  if (promptType === "Serendipity Blend") {
    userPrompt = `
${intro}

당신은 무관한 키워드를 창의적으로 연결해 콘텐츠 전략을 짜는 전문가입니다.
드론, 외계인, 패션 등 전혀 다른 키워드를 엮어 새로운 아이디어 2~3개를 제시해주세요.
결과는 다음 JSON 형식으로 주세요:
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
${intro}

당신은 감정몰입형 영상 전략가입니다.
이 영상에 어울리는 짧은 상황/스토리와 전략을 5줄 이내로 구성해주세요.
JSON 형식:
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
${intro}

당신은 역할극 기반 콘텐츠 기획자입니다.
시청자/전문가/제작자의 입장에서 각각 의견을 주고 전략을 구성해주세요.
JSON 형식:
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
    throw new Error("지원되지 않는 프롬프트입니다.");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" }, // ✅ 문자열 대신 키워드!
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error("❌ GPT 상세 전략 오류:", err.message);
    return null;
  }
}

module.exports = {
  generateStrategy,
  generateDetailStrategy,
};
