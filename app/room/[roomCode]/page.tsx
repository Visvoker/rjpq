import { getPlayersWithRoom } from "@/app/data/room";

export default async function RoomPage() {
  const players = await getPlayersWithRoom();

  return (
    <div>
      <div className="text-red-600">RoomPage</div>

      <div>
        {players.map((player) => (
          <div key={player.id} className="flex gap-x-2">
            <div>name: {player.nickname}</div>
            <div>Id: {player.id}</div>
            <div>Host?: {player.isHost ? "true" : "false"}</div>
            <div>RoomId: {player.roomId}</div>
            <div>RoomCode: {player.room.code}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
