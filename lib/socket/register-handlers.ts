import type { Server, Socket } from "socket.io";

import type { JoinRoomPayload, SelectTilePayload, Tile } from "./types";
import {
  getOrCreateRoom,
  getRoom,
  removePlayerFromRoom,
  removeRoom,
  upsertPlayerInRoom,
} from "./room-store";
import { assignInitialPlayerColor, PLAYER_COLOR_CLASSES } from "./color";
import { deleteRoomById } from "@/app/data/room";

type SocketMeta = {
  roomId?: string;
  playerId?: string;
};

export function registerRoomSocketHandlers(io: Server, socket: Socket) {
  const meta: SocketMeta = {};

  socket.on("join-room", (payload: JoinRoomPayload) => {
    const { roomId, roomCode, player } = payload;

    const previousRoomId = meta.roomId;
    const currentPlayerId = meta.playerId;

    const room = getOrCreateRoom(roomId, roomCode);

    const existingPlayer = room.players.find(
      (existingPlayer) => existingPlayer.playerId === player.playerId,
    );

    const isReconnectingPlayer = Boolean(existingPlayer);

    // 先檢查新房能不能進
    if (!isReconnectingPlayer && room.players.length >= 4) {
      socket.emit("room-action-error", {
        message: "房間已滿",
      });
      return;
    }

    // 確認可進後，再處理換房
    if (previousRoomId && currentPlayerId && previousRoomId !== roomId) {
      const previousRoom = removePlayerFromRoom(
        previousRoomId,
        currentPlayerId,
      );

      socket.leave(previousRoomId);

      if (previousRoom) {
        io.to(previousRoomId).emit("player-list-updated", {
          roomId: previousRoomId,
          players: previousRoom.players,
          playerColors: previousRoom.playerColors,
        });
      }
    }

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

    // 傳 init-state（只給自己）
    socket.emit("init-state", {
      roomId: room.roomId,
      roomCode: room.roomCode,
      players: room.players,
      tiles: room.tiles,
      playerColors: room.playerColors,
    });

    // 廣播玩家列表更新（給整個房間）
    io.to(roomId).emit("player-list-updated", {
      roomId,
      players: room.players,
      playerColors: room.playerColors,
    });
  });

  socket.on("select-tile", (payload: SelectTilePayload) => {
    const { floor, slot } = payload;
    const roomId = meta.roomId;
    const playerId = meta.playerId;

    if (!roomId) {
      socket.emit("tile-select-error", {
        message: "找不到房間資訊",
        floor,
        slot,
      });
      return;
    }

    if (!playerId) {
      socket.emit("tile-select-error", {
        message: "找不到玩家資訊",
        floor,
        slot,
      });
      return;
    }

    const isValidFloor = Number.isInteger(floor) && floor >= 1 && floor <= 10;
    const isValidSlot = Number.isInteger(slot) && slot >= 1 && slot <= 4;

    if (!isValidFloor || !isValidSlot) {
      socket.emit("tile-select-error", {
        message: "格子位置無效",
        floor,
        slot,
      });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit("tile-select-error", {
        message: "房間不存在",
        floor,
        slot,
      });
      return;
    }

    const currentPlayer = room.players.find(
      (player) => player.playerId === playerId,
    );

    if (!currentPlayer) {
      socket.emit("tile-select-error", {
        message: "玩家不在房間內",
        floor,
        slot,
      });
      return;
    }

    // 1. 找這格目前的狀態
    const existingTile = room.tiles.find(
      (tile) => tile.floor === floor && tile.slot === slot,
    );
    // 2. 找玩家在這層原本的選擇

    const playerTileOnFloor = room.tiles.find(
      (tile) => tile.occupiedBy.playerId === playerId && tile.floor === floor,
    );

    // 3. 如果點的是自己原本那格 → toggle off
    if (playerTileOnFloor && playerTileOnFloor.slot === slot) {
      room.tiles = room.tiles.filter(
        (tile) => !(tile.floor === floor && tile.slot === slot),
      );

      io.to(roomId).emit("tile-removed", {
        roomId,
        floor,
        slot,
      });

      return;
    }

    // 4. 如果這格被別人選 → error
    if (existingTile) {
      socket.emit("tile-select-error", {
        message: "此格已被選取",
        floor,
        slot,
      });
      return;
    }

    if (playerTileOnFloor && playerTileOnFloor.slot === slot) {
      room.tiles = room.tiles.filter(
        (tile) => !(tile.floor === floor && tile.slot === slot),
      );

      io.to(roomId).emit("tile-removed", {
        roomId,
        floor,
        slot,
      });
      return;
    }

    // 5. 如果玩家在這層已有其他格 → 先移除原先所選的
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
    // 6. 新增
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

  socket.on("reset-room", () => {
    const roomId = meta.roomId;
    const playerId = meta.playerId;

    if (!roomId) {
      socket.emit("room-action-error", {
        message: "找不到房間資訊",
      });
      return;
    }

    if (!playerId) {
      socket.emit("room-action-error", {
        message: "找不到玩家資訊",
      });
      return;
    }

    const room = getRoom(roomId);

    if (!room) {
      socket.emit("room-action-error", {
        message: "房間不存在",
      });
      return;
    }

    const currentPlayer = room.players.find(
      (player) => player.playerId === playerId,
    );

    if (!currentPlayer) {
      socket.emit("room-action-error", {
        message: "玩家不在房間內",
      });
      return;
    }

    if (!currentPlayer.isHost) {
      socket.emit("room-action-error", {
        message: "只有房主可以重置",
      });
      return;
    }

    room.tiles = [];

    io.to(roomId).emit("room-reset", {
      roomId,
    });
  });

  socket.on("leave-room", async () => {
    const roomId = meta.roomId;
    const playerId = meta.playerId;

    if (!roomId || !playerId) return;

    const room = getRoom(roomId);

    if (!room) {
      socket.emit("room-action-error", {
        message: "房間不存在",
      });
      return;
    }

    const leavingPlayer = room.players.find(
      (player) => player.playerId === playerId,
    );

    if (!leavingPlayer) {
      socket.emit("room-action-error", {
        message: "玩家不在房間內",
      });
      return;
    }

    const removedTiles = room.tiles.filter(
      (tile) => tile.occupiedBy.playerId === playerId,
    );

    room.tiles = room.tiles.filter(
      (tile) => tile.occupiedBy.playerId !== playerId,
    );

    room.players = room.players.filter(
      (player) => player.playerId !== playerId,
    );

    delete room.playerColors[playerId];

    if (room.players.length > 0 && leavingPlayer.isHost) {
      room.players[0].isHost = true;
    }

    socket.leave(roomId);
    socket.emit("left-room");
    meta.roomId = undefined;

    removedTiles.forEach((tile) => {
      io.to(roomId).emit("tile-removed", {
        roomId,
        floor: tile.floor,
        slot: tile.slot,
      });
    });

    if (room.players.length === 0) {
      removeRoom(roomId);
      deleteRoomById(roomId);
    } else {
      io.to(roomId).emit("player-list-updated", {
        roomId,
        players: room.players,
        playerColors: room.playerColors,
      });
    }
  });

  socket.on("disconnect", () => {
    const roomId = meta.roomId;
    const playerId = meta.playerId;

    if (!roomId || !playerId) return;

    const room = getRoom(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.playerId === playerId);

    if (!player) return;

    player.isConnected = false;
    player.disconnectedAt = Date.now();

    setTimeout(async () => {
      const room = getRoom(roomId);

      if (!room) return;

      const targetPlayer = room.players.find((p) => p.playerId === playerId);

      if (!targetPlayer || targetPlayer.isConnected) return;

      const updatedRoom = removePlayerFromRoom(roomId, playerId);

      if (!updatedRoom) {
        await deleteRoomById(roomId);
        return;
      }

      io.to(roomId).emit("player-list-updated", {
        roomId,
        players: updatedRoom.players,
        playerColors: updatedRoom.playerColors,
      });
    }, 10000);
  });
}
