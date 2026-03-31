import type {
  PlayerSession,
  RoomState,
  TileKey,
  TileState,
} from "./socket-types";

const roomStore = new Map<string, RoomState>();

export function getOrCreateRoom(roomId: string, roomCode: string): RoomState {
  const existing = roomStore.get(roomId);
  if (existing) return existing;

  const newRoom: RoomState = {
    roomId,
    roomCode,
    players: new Map<string, PlayerSession>(),
    tiles: new Map<TileKey, TileState>(),
  };

  roomStore.set(roomId, newRoom);
  return newRoom;
}

export function getRoom(roomId: string) {
  return roomStore.get(roomId);
}

export function removePlayerFromRoom(roomId: string, playerId: string) {
  const room = roomStore.get(roomId);
  if (!room) return null;

  room.players.delete(playerId);

  if (room.players.size === 0) {
    roomStore.delete(roomId);
    return null;
  }

  return room;
}

export function getPlayersArray(room: RoomState) {
  return Array.from(room.players.values());
}

export function getTilesArray(room: RoomState) {
  return Array.from(room.tiles.values());
}

export function makeTileKey(floor: number, slot: number): TileKey {
  return `${floor}-${slot}`;
}
