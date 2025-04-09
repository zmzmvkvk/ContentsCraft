require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 상세 전략 생성
async function generateDetailStrategy({ title, memo, promptType }) {
  if (!title || !promptType) throw new Error("title, promptType는 필수입니다.");

  const intro = `
  제목: "${title}"\n메모: ${memo || "(없음)"}

  당신은 유튜브 알고리즘 전문가입니다.
  현재 유튜브 숏폼 알고리즘에서 저작권 관련해서 문제없이 안정적이고 높은 노출을 받을 수 있는 영상의
  - 이상적인 길이, 전개 구조, CTA 포인트
  - 시청 지속률을 높이는 기법(카운트다운, 반전 구성, 텍스트 강조 등)
  - 현재 영상 주제에 적용 가능한 알고리즘 친화 전략
  을 항상 생각해서 답변을 하시오.

  당신은 콘텐츠 카피라이팅 전문가입니다
  현재 영상 주제에 대해 유튜브/숏츠 영상 시작 3초 이내에 시청자를 사로잡을 수 있는 후킹 멘트를
  - 충격 정보형
  - 질문 유도형
  - 반전 스토리형
  - 공감 자극형
  등 다양한 유형으로 st2에 제안해 주세요.

  당신은 유튜브 스토리텔링 전문가입니다.
  현재 영상 주제에 대해 st6에 도입–갈등–전개–전환–해결 구조를 따르는 숏츠영상 대본의 프레임을 만들어 주세요.
  - 각 단계에서 시청자의 이탈을 방지하기 위한 몰입 요소를 포함해 주세요.
  - CTA는 st2 +@에 구독, 댓글, 클릭 등 목적에 따라 유형을 구분해 주세요.”

  당신은 클릭률 최적화 콘텐츠 마케터입니다.
  현재 영상 주제에 대해 이 스크립트에 어울리는 영상/음악 리소스를 st6에 추천해주시고
  - 썸네일용 텍스트 문구 5가지 (8자 내외, 시선 강탈형, 숫자·강조어 포함)
  - 영상 내 콜투액션 문구 5가지 (구독 유도, 링크 클릭, 댓글 유도 등 목적별로 구분)
  를 st4에 제안해 주세요. 타깃 시청층의 행동을 유도할 수 있는 강력한 표현을 포함해 주세요.”
  `;
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
  ],

  "st6": [
    { "idx": 1, "title": "5. 🌎 [대본 초안]" },
    { "idx": 2, "seq": "도입", "script": "이 알바생, 뭔가 이상하다...", "factor": ["클로즈업" , "슬로우모션", "관객반응", "미스터리한 분위기"], "target": "호기심 유발 / 리얼리티 콘텐츠 소비자","clip_recommendation": ["슬로우모션 리액션 영상 (pexels: surprised man)","익살스러운 표정 B-roll","사람들 웃음 폭발 장면"],"bgm_suggestion": "코믹 사운드트랙 - 'Sneaky Snitch' 스타일","image_reference": ["로날두 실루엣 일러스트","관중들의 반응 컷"]},
    { "idx": 3, "seq": "갈등", "script": "손님 중 한 명이 시비를 건다: "당구 좀 치냐?", "factor": ["긴장감 있는 BGM", "도발 자막", "셋업 암시"], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 4, "seq": "전개", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 5, "seq": "전환", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...", "..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 6, "seq": "해결", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]}
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
  ],

  "st6": [
    { "idx": 1, "title": "5. 🌎 [대본 초안]" },
    { "idx": 2, "seq": "도입", "script": "이 알바생, 뭔가 이상하다...", "factor": ["클로즈업" , "슬로우모션", "관객반응", "미스터리한 분위기"], "target": "호기심 유발 / 리얼리티 콘텐츠 소비자","clip_recommendation": ["슬로우모션 리액션 영상 (pexels: surprised man)","익살스러운 표정 B-roll","사람들 웃음 폭발 장면"],"bgm_suggestion": "코믹 사운드트랙 - 'Sneaky Snitch' 스타일","image_reference": ["로날두 실루엣 일러스트","관중들의 반응 컷"]},
    { "idx": 3, "seq": "갈등", "script": "손님 중 한 명이 시비를 건다: "당구 좀 치냐?", "factor": ["긴장감 있는 BGM", "도발 자막", "셋업 암시"], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 4, "seq": "전개", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 5, "seq": "전환", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...", "..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 6, "seq": "해결", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]}
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
  ],

  "st6": [
    { "idx": 1, "title": "5. 🌎 [대본 초안]" },
    { "idx": 2, "seq": "도입", "script": "이 알바생, 뭔가 이상하다...", "factor": ["클로즈업" , "슬로우모션", "관객반응", "미스터리한 분위기"], "target": "호기심 유발 / 리얼리티 콘텐츠 소비자","clip_recommendation": ["슬로우모션 리액션 영상 (pexels: surprised man)","익살스러운 표정 B-roll","사람들 웃음 폭발 장면"],"bgm_suggestion": "코믹 사운드트랙 - 'Sneaky Snitch' 스타일","image_reference": ["로날두 실루엣 일러스트","관중들의 반응 컷"]},
    { "idx": 3, "seq": "갈등", "script": "손님 중 한 명이 시비를 건다: "당구 좀 치냐?", "factor": ["긴장감 있는 BGM", "도발 자막", "셋업 암시"], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 4, "seq": "전개", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 5, "seq": "전환", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...", "..."],"bgm_suggestion": "...","image_reference": ["...","..."]},
    { "idx": 6, "seq": "해결", "script": "...", "factor": [...], "target": "...","clip_recommendation": ["...","...","..."],"bgm_suggestion": "...","image_reference": ["...","..."]}
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
  generateDetailStrategy,
};
