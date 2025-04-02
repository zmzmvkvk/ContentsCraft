module.exports = async function crawlContents(keyword) {
  console.log(`🔍 YouTube에서 키워드 "${keyword}" 검색 중...`);

  // 👉 여기 나중에 Puppeteer 실제 구현으로 바꿀 예정
  // 일단 mock data 리턴
  return [
    {
      id: "yt1",
      title: `${keyword} - 샘플 영상 1`,
      thumbnail: "https://via.placeholder.com/320x180.png?text=Sample1",
      views: 1234567,
      platform: "youtube",
      uploadedAt: "2025-04-01",
      url: "https://youtube.com/watch?v=yt1",
    },
    {
      id: "yt2",
      title: `${keyword} - 샘플 영상 2`,
      thumbnail: "https://via.placeholder.com/320x180.png?text=Sample2",
      views: 543210,
      platform: "youtube",
      uploadedAt: "2025-04-01",
      url: "https://youtube.com/watch?v=yt2",
    },
  ];
};
