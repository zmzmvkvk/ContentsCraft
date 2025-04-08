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
${title}과 전혀 다른 키워드하나를 엮어 새로운 아이디어(${title} + 새로운 키워드) 2~3개를 제시해주세요.

아래는 예시일뿐 형식만 참고하고 내용은 당신이 생각한 내용으로 JSON 형식으로 주세요.
{
  "type": "✅ 무작위 키워드 결합 (Serendipity Blend)",

  "st1": [
    { "idx": 1, "title": "1. 🎯 [전략 요약]" },
    { "idx": 2, "포지션": "크리에이티브 유희형" },
    { "idx": 3, "템플릿": "키워드 스토리텔링 & 연결 시뮬레이션" },
    { "idx": 4, "카테고리": "상상력 자극/패션/디자인/실험형" },
    { "idx": 5, "제작 방식": "주제 융합형 기획 → 미니 다큐 느낌" },
    { "idx": 6, "예상 조회수": "30만~150만+" }
  ],

  "st2": [
    { "idx": 1, "title": "2. ✍️ [영상 기획 전략]" },
    { "idx": 2, "인트로": "드론으로 1000년 전 기술을 재현한다면?" },
    {
      "idx": 3,
      "기획 시뮬 예시": [
        "드론 + 1000년 기술: 고대 석공 방식으로 돌을 자르고, 드론 촬영으로 비교하는 실험 영상",
        "패션 + 절단 기술: 1000년 전 조각 기법으로 만든 패션 액세서리 만들기",
        "외계인 + 전통 기술: 너무 정교해서 외계인이 만들었다는 썰 재현"
      ]
    },
    { "idx": 4, "+@ 요소": "드립 자막, 알쏭한 썸네일, 짧은 호기심 자극 문장" }
  ],

  "st3": [
    { "idx": 1, "title": "3. 🏷 [자동 태그 추천]" },
    {
      "idx": 2,
      "태그": [
        "#실험툰",
        "#드립기획",
        "#드론x역사",
        "#상상력쇼츠",
        "#콘텐츠융합"
      ]
    }
  ],

  "st4": [
    { "idx": 1, "title": "4. 🖼 [썸네일 문구]" },
    {
      "idx": 2,
      "문구": [
        "1000년 전 기술로 드론을 조종한다면?",
        "이 반지, 1000년 전에 만들었다고?"
      ]
    }
  ],

  "st5": [
    { "idx": 1, "title": "5. 🌎 [멀티유즈 전략]" },
    {
      "idx": 2,
      "전략": [
        "유튜브 쇼츠, 인스타 릴스 동시에 업로드",
        "블로그 전환 시: 기획 배경 + 드립 요소 정리해서 SEO 콘텐츠화"
      ]
    }
  ]
}
`;
  } else if (promptType === "Emotive Narrative") {
    userPrompt = `
${intro}

당신은 감정몰입형 영상 전략가입니다.
이 영상에 어울리는 짧은 상황/스토리와 전략을 기승전결에 맞춰서 구성해주세요.

아래는 예시일뿐 형식만 참고하고 내용은 당신이 생각한 내용으로 JSON 형식으로 보내주시오.
{
  "type": "✅ 감정·스토리몰입 (Emotive Narrative)",

  "st1": [
    { "idx": 1, "title": "1. 🎯 [전략 요약]" },
    { "idx": 2, "포지션": "감정 자극형 내레이션" },
    { "idx": 3, "템플릿": "스토리텔링 + 감정몰입" },
    { "idx": 4, "카테고리": "미스터리/놀람/감탄형 콘텐츠" },
    { "idx": 5, "제작 방식": "클립 조합형 영상 + 자막 강조" },
    { "idx": 6, "예상 조회수": "200만+" }
  ],

  "st2": [
    { "idx": 1, "title": "2. ✍️ [영상 기획 전략]" },
    { "idx": 2, "인트로": "이 기술, 인간이 만든 게 아니라고?" },
    {
      "idx": 3,
      "기승전결 스토리": {
        "기": "고대 기술의 비밀, 흥미 유발하는 의문 제기",
        "승": "놀라운 절단 시연, 현장 영상 클립 삽입",
        "전": "“현대 기술로도 불가능” 자막 + 논란 강조",
        "결": "“진짜 이걸 만든 사람은 누구였을까” → 여운 남기기"
      }
    },
    { "idx": 4, "+@ 요소": "BGM 전환, 흑백 연출, 반복 컷 편집" }
  ],

  "st3": [
    { "idx": 1, "title": "3. 🏷 [자동 태그 추천]" },
    {
      "idx": 2,
      "태그": [
        "#감정몰입",
        "#미스터리기술",
        "#스토리쇼츠",
        "#인류기원설",
        "#충격과감탄"
      ]
    }
  ],

  "st4": [
    { "idx": 1, "title": "4. 🖼 [썸네일 문구]" },
    {
      "idx": 2,
      "문구": [
        "이 기술, 인간이 만든 게 아니라는데…?",
        "1000년 전 돌 절단 기술, 실화임?"
      ]
    }
  ],

  "st5": [
    { "idx": 1, "title": "5. 🌎 [멀티유즈 전략]" },
    {
      "idx": 2,
      "전략": [
        "숏폼 영상 외에 스레드형 트위터 전개 가능",
        "해외 커뮤니티(레딧 등) 번역 포스팅으로 바이럴 유도"
      ]
    }
  ]
}
`;
  } else if (promptType === "Role Play Scenario") {
    userPrompt = `
${intro}

당신은 역할극 기반 콘텐츠 기획자입니다.
시청자/전문가/제작자의 입장에서 각각 의견을 주고 전략을 구성해주세요.

아래는 예시일뿐 형식만 참고하고 내용은 당신이 생각한 내용으로 JSON 형식으로 보내주시오.
{
  "type": "✅ 역할극 (Role Play Scenario)",

  "st1": [
    { "idx": 1, "title": "1. 🎯 [전략 요약]" },
    { "idx": 2, "포지션": "드라마형 캐릭터 시뮬레이션" },
    { "idx": 3, "템플릿": "역할극 시나리오 기반" },
    { "idx": 4, "카테고리": "브이로그형/몰입형 에피소드" },
    { "idx": 5, "제작 방식": "상황극 또는 1인칭 시점 기반" },
    { "idx": 6, "예상 조회수": "50만~200만+" }
  ],

  "st2": [
    { "idx": 1, "title": "2. ✍️ [영상 기획 전략]" },
    { "idx": 2, "인트로": "오늘, 나는 1000년 전으로 돌아간다" },
    {
      "idx": 3,
      "기승전결 스토리": {
        "기": "고대 기술을 복원해보는 컨셉 도입",
        "승": "실제 제작/재현 상황을 인물 시점으로 풀어감",
        "전": "“이게 실제로 가능하다고?” 감탄 컷 삽입",
        "결": "시도 결과 + 교훈 또는 유쾌한 마무리"
      }
    },
    { "idx": 4, "+@ 요소": "1인칭 브이로그 스타일 편집, 채팅창/반응 자막 활용" }
  ],

  "st3": [
    { "idx": 1, "title": "3. 🏷 [자동 태그 추천]" },
    {
      "idx": 2,
      "태그": [
        "#몰입형쇼츠",
        "#역할극",
        "#과거체험",
        "#브이로그스타일",
        "#실험콘텐츠"
      ]
    }
  ],

  "st4": [
    { "idx": 1, "title": "4. 🖼 [썸네일 문구]" },
    {
      "idx": 2,
      "문구": [
        "1000년 전으로 직접 가봤습니다",
        "이 돌을 진짜 자를 수 있다고?"
      ]
    }
  ],

  "st5": [
    { "idx": 1, "title": "5. 🌍 [멀티유즈 전략]" },
    {
      "idx": 2,
      "전략": [
        "틱톡용 편집: 빠른 컷 + 사운드 집중",
        "블로그 전환: 고대 기술 체험기 + 사진 기반 정리글"
      ]
    }
  ]
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

    // 백엔드에서 GPT 응답 파싱 후
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
