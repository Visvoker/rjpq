import { getRoomByCode } from "@/app/data/room";

type RoomPageProps = {
  params: Promise<{
    roomCode: string;
  }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomCode } = await params;

  const room = await getRoomByCode(roomCode);

  const host = room?.players.find((p) => p.isHost);

  if (!room) {
    return <div>房間不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Room</h1>
        <p>房號：{room.code}</p>
        <p>房主：{host?.nickname ?? "尚未設定"}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">Players</h2>
        <div className="space-y-2">
          {room.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span>{player.nickname}</span>
              {player.isHost && (
                <span className="text-sm text-red-500">Host</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
