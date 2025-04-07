import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchFavoritesFromDB,
  addFavoriteToDB,
  removeFavoriteFromDB,
  updateFavoriteMemo,
  updateFavoriteStrategy,
} from "../api/firebaseService"; // 🔁 firebaseService 경로 맞게 수정해줘

export const useCrawlStore = create(
  persist(
    (set, get) => ({
      videos: [],
      isCrawled: false,
      liked: [],

      setVideos: (data) => set({ videos: data, isCrawled: true }),

      toggleLike: async (video) => {
        const { liked } = get();
        const exists = liked.find((v) => v.id === video.id);
        if (exists) {
          await removeFavoriteFromDB(video.id);
          set({ liked: liked.filter((v) => v.id !== video.id) });
        } else {
          await addFavoriteToDB(video);
          set({ liked: [...liked, video] });
        }
      },

      updateMemo: async (id, memo) => {
        const { liked } = get();
        const updated = liked.map((v) => (v.id === id ? { ...v, memo } : v));
        await updateFavoriteMemo(id, memo);
        set({ liked: updated });
      },

      // ✅ GPT 전략 결과 저장용
      updateStrategy: async (id, strategyObj) => {
        if (!strategyObj || typeof strategyObj !== "object") {
          console.error("❌ 저장할 전략 객체가 유효하지 않음:", strategyObj);
          return;
        }

        const { liked } = get();
        const updated = liked.map((v) =>
          v.id === id ? { ...v, ...strategyObj } : v
        );
        await updateFavoriteStrategy(id, strategyObj);
        set({ liked: updated });
      },

      syncFavorites: async () => {
        const data = await fetchFavoritesFromDB();
        set({ liked: data });
      },

      reset: () => set({ videos: [], isCrawled: false }),
    }),
    {
      name: "crawl-storage",
    }
  )
);
