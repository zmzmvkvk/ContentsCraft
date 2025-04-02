module.exports = async function crawlDouyin(keyword) {
  return [
    {
      id: "dy1",
      title: `${keyword} 더우인 영상`,
      thumbnail: "https://via.placeholder.com/320x180.png?text=Douyin",
      url: "https://douyin.com/video/dy1",
      views: 2200000,
      uploadedAt: "1일 전",
      platform: "douyin",
    },
  ];
};
