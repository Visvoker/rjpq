"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getSocket } from "@/lib/socket/client";
import { RoomGrid } from "@/components/room/room-grid";
import { RoomInfoCard } from "@/components/room/room-info-card";
import { PlayersCard } from "@/components/room/room-players-card";
import { createPlayerColorMap } from "@/lib/color";

type Player = {
  id: string;
  nickname: string;
  isHost: boolean;
};

type SocketPlayer = {
  socketId: string;
  playerId: string;
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

type SocketTile = {
  floor: number;
  slot: number;
  occupiedBy: {
    playerId: string;
    nickname: string;
  };
  selectedAt: number;
};

type RoomRealtimeSectionProps = {
  roomId: string;
  roomCode: string;
  currentPlayer: CurrentPlayer;
  initialPlayers: Player[];
  initialSelections: Selection[];
  actionsSlot: ReactNode;
};

export function RoomRealtimeSection({
  roomId,
  roomCode,
  currentPlayer,
  initialPlayers,
  initialSelections,
  actionsSlot,
}: RoomRealtimeSectionProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [selections, setSelections] = useState<Selection[]>(initialSelections);

  useEffect(() => {
    const socket = getSocket();

    // connection
    const onConnect = () => {
      console.log("client connected:", socket.id);

      socket.emit("join-room", {
        roomId,
        roomCode,
        player: currentPlayer,
      });
    };
    // init
    const onInitState = (payload: {
      roomId: string;
      roomCode: string;
      players: SocketPlayer[];
      tiles: SocketTile[];
    }) => {
      const normalizedPlayers: Player[] = payload.players.map((player) => ({
        id: player.playerId,
        nickname: player.nickname,
        isHost: player.isHost,
      }));

      const normalizedSelections: Selection[] = payload.tiles.map((tile) => ({
        id: `${tile.floor}-${tile.slot}`,
        floor: tile.floor,
        slot: tile.slot,
        playerId: tile.occupiedBy.playerId,
      }));

      setPlayers(normalizedPlayers);
      setSelections(normalizedSelections);
    };

    // players
    const onPlayerListUpdated = (payload: {
      roomId: string;
      players: SocketPlayer[];
    }) => {
      const normalizedPlayers: Player[] = payload.players.map((player) => ({
        id: player.playerId,
        nickname: player.nickname,
        isHost: player.isHost,
      }));

      setPlayers(normalizedPlayers);
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
    const onTileSelectError = (payload: { message: string }) => {
      console.error(payload.message);
    };

    // room actions
    const onRoomReset = (payload: { roomId: string }) => {
      setSelections([]);
    };

    socket.on("connect", onConnect);
    socket.on("init-state", onInitState);
    socket.on("player-list-updated", onPlayerListUpdated);
    socket.on("tile-updated", onTileUpdated);
    socket.on("tile-select-error", onTileSelectError);
    socket.on("tile-removed", onTileRemoved);
    socket.on("room-reset", onRoomReset);

    return () => {
      socket.off("connect", onConnect);
      socket.off("init-state", onInitState);
      socket.off("player-list-updated", onPlayerListUpdated);
      socket.off("tile-updated", onTileUpdated);
      socket.off("tile-select-error", onTileSelectError);
      socket.off("tile-removed", onTileRemoved);
      socket.off("room-reset", onRoomReset);
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

  const playerColorMap = useMemo(() => {
    return createPlayerColorMap(players);
  }, [players]);

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
