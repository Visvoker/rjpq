import { create } from "zustand";
import { persist } from "zustand/middleware";

type PlayerStore = {
  nickname: string;
  setNickname: (nickname: string) => void;
  clearNickname: () => void;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      nickname: "",
      setNickname: (nickname) => set({ nickname }),
      clearNickname: () => set({ nickname: "" }),
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "rjpq-player-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
