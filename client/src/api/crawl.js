// src/api/crawl.js
import axios from "./axiosInstance";

export const crawlVideos = async ({ keyword }) => {
  const res = await axios.post("/crawl", {
    keyword, // ✅ platform 안 보냄
  });

  return res.data;
};
