import type { ConnectedPlayer, RoomState } from "./types";

const roomStore: Record<string, RoomState> = {};

export function createEmptyRoom(roomId: string, roomCode: string): RoomState {
  return {
    roomId,
    roomCode,
    players: [],
    tiles: [],
    playerColors: {},
  };
}

export function getOrCreateRoom(roomId: string, roomCode: string): RoomState {
  const existingRoom = roomStore[roomId];

  if (existingRoom) {
    return existingRoom;
  }

  const newRoom = createEmptyRoom(roomId, roomCode);
  roomStore[roomId] = newRoom;

  return newRoom;
}

export function getRoom(roomId: string): RoomState | undefined {
  return roomStore[roomId];
}

export function upsertPlayerInRoom(
  room: RoomState,
  player: ConnectedPlayer,
): void {
  const existingPlayerIndex = room.players.findIndex(
    (existingPlayer) => existingPlayer.playerId === player.playerId,
  );

  // if (existingPlayerIndex === -1) {
  //   room.players.push(player);
  //   return;
  // }

  // room.players[existingPlayerIndex] = player;

  if (existingPlayerIndex !== -1) {
    // 已存在 → 更新 socketId（例如 refresh）
    room.players[existingPlayerIndex] = {
      ...room.players[existingPlayerIndex],
      socketId: player.socketId,
    };
    return;
  }

  // ✅ 新玩家
  const isFirstPlayer = room.players.length === 0;

  room.players.push({
    ...player,
    isHost: isFirstPlayer,
  });
}

export function removePlayerFromRoom(
  roomId: string,
  playerId: string,
): RoomState | null {
  const room = roomStore[roomId];

  if (!room) {
    return null;
  }

  const leavingPlayer = room.players.find(
    (player) => player.playerId === playerId,
  );

  const wasHost = leavingPlayer?.isHost ?? false;
  // const wasHost = leavingPlayer? leavingPlayer.isHost: undefined;

  room.players = room.players.filter((player) => player.playerId !== playerId);

  room.tiles = room.tiles.filter(
    (tile) => tile.occupiedBy.playerId !== playerId,
  );

  delete room.playerColors[playerId];

  if (room.players.length === 0) {
    delete roomStore[roomId];
    return null;
  }

  if (wasHost) {
    room.players[0] = {
      ...room.players[0],
      isHost: true,
    };
  }

  return room;
}

export function removeRoom(roomId: string) {
  delete roomStore[roomId];
}
