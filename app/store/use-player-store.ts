import { create } from "zustand";
import { persist } from "zustand/middleware";

type PlayerStore = {
  nickname: string;
  setNickname: (nickname: string) => void;
  clearNickname: () => void;
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      nickname: "",
      setNickname: (nickname) => set({ nickname }),
      clearNickname: () => set({ nickname: "" }),
    }),
    {
      name: "rjpq-player-storage",
    },
  ),
);
