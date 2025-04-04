require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    console.error("❌ GPT 전략 생성 오류:", error.message);
    return "";
  }
}

module.exports = { generateStrategy };
