import { PlayerColor } from "./color";

export type TileKey = `${number}-${number}`;

export type Player = {
  playerId: string;
  nickname: string;
  isHost: boolean;
  isConnected: boolean;
  disconnectedAt?: number;
};

export type ConnectedPlayer = Player & {
  socketId: string;
};

export type OccupiedBy = {
  playerId: string;
  nickname: string;
};

export type Tile = {
  floor: number;
  slot: number;
  occupiedBy: OccupiedBy;
  selectedAt: number;
};

export type RoomState = {
  roomId: string;
  roomCode: string;
  players: ConnectedPlayer[];
  tiles: Tile[];
  playerColors: Record<string, PlayerColor>;
};

export type JoinRoomPayload = {
  roomId: string;
  roomCode: string;
  player: Player;
};

export type SelectTilePayload = {
  roomId: string;
  floor: number;
  slot: number;
};

export type InitStatePayload = {
  roomId: string;
  roomCode: string;
  players: ConnectedPlayer[];
  tiles: Tile[];
  playerColors: Record<string, PlayerColor>;
};

export type TileUpdatedPayload = {
  roomId: string;
  tile: Tile;
};

export type PlayerListUpdatedPayload = {
  roomId: string;
  players: ConnectedPlayer[];
  playerColors: Record<string, PlayerColor>;
};

export type TileSelectErrorPayload = {
  message: string;
  floor: number;
  slot: number;
};
