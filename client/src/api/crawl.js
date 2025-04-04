// src/api/crawl.js
import axiosInstance from "./axiosInstance"; // 이걸로 바꿔야 함

export async function crawlVideos(query) {
  const response = await axiosInstance.post("/crawl", { query }); // baseURL + /crawl = /api/crawl
  return response.data;
}
