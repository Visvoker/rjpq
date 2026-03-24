import { create } from "zustand";
import { persist } from "zustand/middleware";

type PlayerState = {
  nickname: string | null;
  playerId: string | null;
  roomId: string | null;
  roomCode: string | null;
  isHost: boolean;
  setPlayer: (payload: {
    nickname: string;
    playerId: string;
    roomId: string;
    roomCode: string;
    isHost: boolean;
  }) => void;
  clearPlayer: () => void;
  clearRoomSession: () => void;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      nickname: null,
      playerId: null,
      roomId: null,
      roomCode: null,
      isHost: false,
      setPlayer: ({ nickname, playerId, roomId, roomCode, isHost }) =>
        set({
          nickname,
          playerId,
          roomId,
          roomCode,
          isHost,
        }),
      clearPlayer: () =>
        set({
          nickname: null,
          playerId: null,
          roomId: null,
          roomCode: null,
          isHost: false,
        }),
      clearRoomSession: () =>
        set((state) => ({
          nickname: state.nickname,
          playerId: null,
          roomId: null,
          roomCode: null,
          isHost: false,
        })),
    }),
    {
      name: "rjpq-player-storage",
    },
  ),
);
