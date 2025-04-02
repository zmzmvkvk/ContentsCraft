module.exports = async function crawlTikTok(keyword) {
  return [
    {
      id: "tt1",
      title: `${keyword} TikTok 샘플 영상`,
      thumbnail: "https://via.placeholder.com/320x180.png?text=TikTok",
      url: "https://tiktok.com/video/tt1",
      views: 1400000,
      uploadedAt: "2 days ago",
      platform: "tiktok",
    },
  ];
};
