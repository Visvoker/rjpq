import type { Server, Socket } from "socket.io";
import {
  getOrCreateRoom,
  getPlayersArray,
  getRoom,
  getTilesArray,
  makeTileKey,
  removePlayerFromRoom,
} from "./room-store";
import type {
  JoinRoomPayload,
  SelectTilePayload,
  TileState,
} from "./socket-types";

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

    room.players.set(player.playerId, {
      socketId: socket.id,
      playerId: player.playerId,
      nickname: player.nickname,
      isHost: player.isHost,
    });

    socket.emit("init-state", {
      roomId: room.roomId,
      roomCode: room.roomCode,
      players: getPlayersArray(room),
      tiles: getTilesArray(room),
    });

    io.to(roomId).emit("player-list-updated", {
      roomId,
      players: getPlayersArray(room),
    });
  });

  socket.on("select-tile", (payload: SelectTilePayload) => {
    const { roomId, floor, slot } = payload;
    const playerId = meta.playerId;

    if (!playerId) {
      socket.emit("tile-select-error", {
        message: "player not found in socket session",
        floor,
        slot,
      });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit("tile-select-error", {
        message: "room not found",
        floor,
        slot,
      });
      return;
    }

    const player = room.players.get(playerId);
    if (!player) {
      socket.emit("tile-select-error", {
        message: "player not found in room",
        floor,
        slot,
      });
      return;
    }

    const tileKey = makeTileKey(floor, slot);
    const existingTile = room.tiles.get(tileKey);

    if (existingTile) {
      socket.emit("tile-select-error", {
        message: "tile already occupied",
        floor,
        slot,
      });
      return;
    }

    const previousSelectionOnSameFloor = Array.from(room.tiles.entries()).find(
      ([, tile]) =>
        tile.floor === floor && tile.occupiedBy.playerId === player.playerId,
    );

    if (previousSelectionOnSameFloor) {
      const [previousTileKey, previousTile] = previousSelectionOnSameFloor;

      room.tiles.delete(previousTileKey);

      io.to(roomId).emit("tile-removed", {
        roomId,
        floor: previousTile.floor,
        slot: previousTile.slot,
      });
    }

    const newTile: TileState = {
      floor,
      slot,
      occupiedBy: {
        playerId: player.playerId,
        nickname: player.nickname,
      },
      selectedAt: Date.now(),
    };

    room.tiles.set(tileKey, newTile);

    io.to(roomId).emit("tile-updated", {
      roomId,
      tile: newTile,
    });
  });

  socket.on("reset-room", (payload: { roomId: string }) => {
    const { roomId } = payload;
    const playerId = meta.playerId;

    if (!playerId) {
      socket.emit("reset-room-error", {
        message: "player not found in socket session",
      });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit("reset-room-error", {
        message: "room not found",
      });
      return;
    }

    const player = room.players.get(playerId);
    if (!player) {
      socket.emit("reset-room-error", {
        message: "player not found in room",
      });
      return;
    }

    if (!player.isHost) {
      socket.emit("reset-room-error", {
        message: "only host can reset room",
      });
      return;
    }

    room.tiles.clear();

    io.to(roomId).emit("room-reset", {
      roomId,
    });
  });

  socket.on("disconnect", () => {
    const { roomId, playerId } = meta;

    if (!roomId || !playerId) return;

    const room = removePlayerFromRoom(roomId, playerId);

    if (!room) return;

    io.to(roomId).emit("player-list-updated", {
      roomId,
      players: getPlayersArray(room),
    });
  });
}
