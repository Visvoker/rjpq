import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getRoomByCode } from "@/app/data/room";
import { leaveRoom } from "@/app/actions/room";
import { ResetButton } from "@/components/room/resetButton";
import { LeaveButton } from "@/components/room/leaveButton";
import { CopyRoomCodeButton } from "@/components/room/copyButton";
import { RoomRealtimeSection } from "@/components/room/room-realtime-section";

type RoomPageProps = {
  params: Promise<{
    roomCode: string;
  }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomCode } = await params;

  const room = await getRoomByCode(roomCode);

  if (!room) {
    return <div className="p-6">房間不存在</div>;
  }

  const players = room.players;

  const cookieStore = await cookies();
  const currentPlayerId = cookieStore.get("playerId")?.value;

  if (!currentPlayerId) {
    return <div className="p-6">找不到目前玩家</div>;
  }

  const currentPlayer = room.players.find(
    (player) => player.id === currentPlayerId,
  );

  if (!currentPlayer) {
    return <div className="p-6">目前玩家不在此房間</div>;
  }

  async function handleLeave() {
    "use server";
    await leaveRoom();
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6 ">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">RJPQ Room</h1>
          <p className="text-sm text-muted-foreground">房號：{room.code}</p>
        </div>

        <RoomRealtimeSection
          roomId={room.id}
          roomCode={room.code}
          currentPlayer={{
            playerId: currentPlayer.id,
            nickname: currentPlayer.nickname,
            isHost: currentPlayer.isHost,
          }}
          initialPlayers={players}
          initialSelections={room.selections}
          actionsSlot={
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <CopyRoomCodeButton roomCode={room.code} />
                {currentPlayer.isHost && <ResetButton roomId={room.id} />}
                <LeaveButton action={handleLeave} />
              </CardContent>
            </Card>
          }
        />
      </div>
    </div>
  );
}
