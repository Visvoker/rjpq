"use client";

import { toast } from "sonner";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { getSocket } from "@/lib/socket/client";
import { RoomGrid } from "@/components/room/room-grid";
import { RoomInfoCard } from "@/components/room/room-info-card";
import { PlayersCard } from "@/components/room/room-players-card";
import type {
  ConnectedPlayer as SocketPlayer,
  Tile as SocketTile,
} from "@/lib/socket/types";
import { PlayerColor } from "@/lib/socket/color";

type Player = {
  id: string;
  nickname: string;
  isHost: boolean;
};

type Selection = {
  id: string;
  floor: number;
  slot: number;
  playerId: string;
};

type CurrentPlayer = {
  playerId: string;
  nickname: string;
  isHost: boolean;
};

type RoomRealtimeSectionProps = {
  roomId: string;
  roomCode: string;
  currentPlayer: CurrentPlayer;
  actionsSlot: ReactNode;
};

function normalizePlayers(players: SocketPlayer[]): Player[] {
  return players.map((player) => ({
    id: player.playerId,
    nickname: player.nickname,
    isHost: player.isHost,
  }));
}

function normalizeSelections(tiles: SocketTile[]): Selection[] {
  return tiles.map((tile) => ({
    id: `${tile.floor}-${tile.slot}`,
    floor: tile.floor,
    slot: tile.slot,
    playerId: tile.occupiedBy.playerId,
  }));
}

export function RoomRealtimeSection({
  roomId,
  roomCode,
  currentPlayer,
  actionsSlot,
}: RoomRealtimeSectionProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [playerColorMap, setPlayerColorMap] = useState<
    Record<string, PlayerColor>
  >({});

  useEffect(() => {
    const socket = getSocket();

    const emitJoinRoom = () => {
      socket.emit("join-room", {
        roomId,
        roomCode,
        player: currentPlayer,
      });
    };

    // connection
    const onConnect = () => {
      emitJoinRoom();
    };

    // init
    const onInitState = (payload: {
      roomId: string;
      roomCode: string;
      players: SocketPlayer[];
      tiles: SocketTile[];
      playerColors: Record<string, PlayerColor>;
    }) => {
      console.log("init-state players:", payload.players);

      setPlayers(normalizePlayers(payload.players));
      setSelections(normalizeSelections(payload.tiles));
      setPlayerColorMap(payload.playerColors);
    };

    // players
    const onPlayerListUpdated = (payload: {
      roomId: string;
      players: SocketPlayer[];
      playerColors: Record<string, PlayerColor>;
    }) => {
      setPlayers(normalizePlayers(payload.players));
      setPlayerColorMap(payload.playerColors);
    };

    // tiles
    const onTileUpdated = (payload: { roomId: string; tile: SocketTile }) => {
      const normalizedTile: Selection = {
        id: `${payload.tile.floor}-${payload.tile.slot}`,
        floor: payload.tile.floor,
        slot: payload.tile.slot,
        playerId: payload.tile.occupiedBy.playerId,
      };

      setSelections((prev) => {
        const exists = prev.some(
          (item) =>
            item.floor === normalizedTile.floor &&
            item.slot === normalizedTile.slot,
        );

        if (exists) {
          return prev.map((item) =>
            item.floor === normalizedTile.floor &&
            item.slot === normalizedTile.slot
              ? normalizedTile
              : item,
          );
        }

        return [...prev, normalizedTile];
      });
    };

    const onTileRemoved = (payload: {
      roomId: string;
      floor: number;
      slot: number;
    }) => {
      setSelections((prev) =>
        prev.filter(
          (item) =>
            !(item.floor === payload.floor && item.slot === payload.slot),
        ),
      );
    };

    const onTileSelectError = (payload: {
      message: string;
      floor: number;
      slot: number;
    }) => {
      console.error("tile-select-error:", payload);
      toast.error(payload.message);
    };

    const onRoomReset = () => {
      setSelections([]);
      toast.success("已重置所有格子");
    };

    const onRoomActionError = (payload: { message: string }) => {
      console.log("room-action-error", payload.message);
      toast.error(payload.message);
    };

    socket.on("connect", onConnect);

    if (socket.connected) {
      emitJoinRoom();
    }

    socket.on("init-state", onInitState);
    socket.on("player-list-updated", onPlayerListUpdated);
    socket.on("tile-updated", onTileUpdated);
    socket.on("tile-select-error", onTileSelectError);
    socket.on("tile-removed", onTileRemoved);
    socket.on("room-reset", onRoomReset);
    socket.on("room-action-error", onRoomActionError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("init-state", onInitState);
      socket.off("player-list-updated", onPlayerListUpdated);
      socket.off("tile-updated", onTileUpdated);
      socket.off("tile-select-error", onTileSelectError);
      socket.off("tile-removed", onTileRemoved);
      socket.off("room-reset", onRoomReset);
      socket.off("room-action-error", onRoomActionError);
    };
  }, [
    roomId,
    roomCode,
    currentPlayer.playerId,
    currentPlayer.nickname,
    currentPlayer.isHost,
  ]);

  const host = useMemo(
    () => players.find((player) => player.isHost),
    [players],
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:px-2">
      <div className="w-full md:col-span-1 md:h-full">
        <RoomGrid
          roomId={roomId}
          currentPlayerId={currentPlayer.playerId}
          selections={selections}
          playerColorMap={playerColorMap}
        />
      </div>

      <div className="space-y-6 h-full md:col-span-1">
        <RoomInfoCard
          roomCode={roomCode}
          hostNickname={host ? host.nickname : "無"}
          playerCount={players.length}
        />

        <PlayersCard
          players={players}
          currentPlayerId={currentPlayer.playerId}
          playerColorMap={playerColorMap}
        />

        {actionsSlot}
      </div>
    </div>
  );
}
