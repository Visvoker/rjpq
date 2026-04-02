import type { Server, Socket } from "socket.io";

import type { JoinRoomPayload, SelectTilePayload, Tile } from "./types";
import { getOrCreateRoom, getRoom, upsertPlayerInRoom } from "./room-store";
import { assignInitialPlayerColor, PLAYER_COLOR_CLASSES } from "./color";

type SocketMeta = {
  roomId?: string;
  playerId?: string;
};

export function registerRoomSocketHandlers(io: Server, socket: Socket) {
  const meta: SocketMeta = {};

  socket.on("join-room", (payload: JoinRoomPayload) => {
    const { roomId, roomCode, player } = payload;

    const room = getOrCreateRoom(roomId, roomCode);

    socket.join(roomId);
    meta.roomId = roomId;
    meta.playerId = player.playerId;

    upsertPlayerInRoom(room, {
      ...player,
      socketId: socket.id,
    });

    if (!room.playerColors[player.playerId]) {
      const color = assignInitialPlayerColor(
        player.playerId,
        room.playerColors,
        PLAYER_COLOR_CLASSES,
      );

      if (color) {
        room.playerColors[player.playerId] = color;
      }
    }

    // 3️⃣ 傳 init-state（只給自己）
    socket.emit("init-state", {
      roomId: room.roomId,
      roomCode: room.roomCode,
      players: room.players,
      tiles: room.tiles,
      playerColors: room.playerColors,
    });

    // 4️⃣ 廣播玩家列表更新（給整個房間）
    io.to(roomId).emit("player-list-updated", {
      roomId,
      players: room.players,
      playerColors: room.playerColors,
    });
  });

  socket.on("select-tile", (payload: SelectTilePayload) => {
    const { roomId, floor, slot } = payload;

    const room = getRoom(roomId);

    if (!room) {
      socket.emit("tile-select-error", {
        message: "房間不存在",
        floor,
        slot,
      });
      return;
    }

    if (!meta.playerId) {
      socket.emit("tile-select-error", {
        message: "找不到玩家資訊",
        floor,
        slot,
      });
      return;
    }

    const currentPlayer = room.players.find(
      (player) => player.playerId === meta.playerId,
    );

    if (!currentPlayer) {
      socket.emit("tile-select-error", {
        message: "玩家不在房間內",
        floor,
        slot,
      });
      return;
    }

    // 1. 先檢查這格有沒有人選過
    const existingTile = room.tiles.find(
      (tile) => tile.floor === floor && tile.slot === slot,
    );

    if (existingTile) {
      socket.emit("tile-select-error", {
        message: "此格已被選取",
        floor,
        slot,
      });
      return;
    }

    const playerTileOnFloor = room.tiles.find(
      (tile) =>
        tile.occupiedBy.playerId === meta.playerId && tile.floor === floor,
    );

    if (playerTileOnFloor && playerTileOnFloor.slot === slot) {
      return;
    }

    if (playerTileOnFloor) {
      room.tiles = room.tiles.filter(
        (tile) =>
          !(tile.occupiedBy.playerId === meta.playerId && tile.floor === floor),
      );

      io.to(roomId).emit("tile-removed", {
        roomId,
        floor: playerTileOnFloor.floor,
        slot: playerTileOnFloor.slot,
      });
    }

    const newTile: Tile = {
      floor,
      slot,
      occupiedBy: {
        playerId: currentPlayer.playerId,
        nickname: currentPlayer.nickname,
      },
      selectedAt: Date.now(),
    };

    room.tiles.push(newTile);

    io.to(roomId).emit("tile-updated", {
      roomId,
      tile: newTile,
    });
  });
}
