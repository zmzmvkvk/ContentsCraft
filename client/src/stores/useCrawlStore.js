// src/stores/useCrawlStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCrawlStore = create(
  persist(
    (set, get) => ({
      videos: [],
      isCrawled: false,
      liked: [], // ❤️ 좋아요한 영상들만 따로 저장

      setVideos: (data) => set({ videos: data, isCrawled: true }),

      toggleLike: (video) => {
        const { liked } = get();
        const exists = liked.find((v) => v.id === video.id);
        if (exists) {
          set({ liked: liked.filter((v) => v.id !== video.id) });
        } else {
          set({ liked: [...liked, video] });
        }
      },

      reset: () => set({ videos: [], isCrawled: false, liked: [] }),
    }),
    { name: "crawl-storage" }
  )
);
