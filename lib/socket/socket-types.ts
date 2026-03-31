export type TileKey = `${number}-${number}`;

export type JoinRoomPayload = {
  roomId: string;
  roomCode: string;
  player: {
    playerId: string;
    nickname: string;
    isHost: boolean;
  };
};

export type SelectTilePayload = {
  roomId: string;
  floor: number;
  slot: number;
};

export type PlayerSession = {
  socketId: string;
  playerId: string;
  nickname: string;
  isHost: boolean;
};

export type TileState = {
  floor: number;
  slot: number;
  occupiedBy: {
    playerId: string;
    nickname: string;
  };
  selectedAt: number;
};

export type RoomState = {
  roomId: string;
  roomCode: string;
  players: Map<string, PlayerSession>;
  tiles: Map<TileKey, TileState>;
};

export type InitStatePayload = {
  roomId: string;
  roomCode: string;
  players: PlayerSession[];
  tiles: TileState[];
};

export type TileUpdatedPayload = {
  roomId: string;
  tile: TileState;
};

export type PlayerListUpdatedPayload = {
  roomId: string;
  players: PlayerSession[];
};

export type TileSelectErrorPayload = {
  message: string;
  floor: number;
  slot: number;
};
