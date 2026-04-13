"use client";

import { toast } from "sonner";
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
import { buildPlayerPaths } from "@/lib/build-player-paths";
import { RoomActionsCard } from "./room-actions-card";
import { RoomPlayerPath } from "./room-player-path";

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
      console.log("tile:", payload.tiles);

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

  const playerPath = useMemo(() => {
    return buildPlayerPaths(selections, currentPlayer.playerId, 10);
  }, [selections, currentPlayer.playerId]);

  return (
    <div className="w-full max-w-sm mx-auto md:max-w-none grid grid-cols-1 gap-y-6 md:grid-cols-2 md:px-2 md:w-full md:h-full">
      <div className="">
        <RoomGrid
          roomId={roomId}
          currentPlayerId={currentPlayer.playerId}
          selections={selections}
          playerColorMap={playerColorMap}
        />
      </div>
      {/* mobile：path 內嵌在 actions */}
      <div className="block md:hidden">
        <RoomActionsCard roomCode={roomCode} playerPath={playerPath} showPath />
      </div>
      <div className="space-y-6 h-full">
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

        <div className="hidden md:block ">
          <RoomActionsCard roomCode={roomCode} playerPath={playerPath} />
        </div>

        <div className="hidden md:block ">
          <RoomPlayerPath playerPath={playerPath} />
        </div>
      </div>
    </div>
  );
}
