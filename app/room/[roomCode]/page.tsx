import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getRoomByCode } from "@/app/data/room";
import { ResetButton } from "@/components/room/reset-button";
import { RoomRealtimeSection } from "@/components/room/room-realtime-section";
import { LeaveButton } from "@/components/room/leave-button";
import { CopyRoomCodeButton } from "@/components/room/copy-button";

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

  const cookieStore = await cookies();

  const currentPlayerId = cookieStore.get("playerId")?.value;
  const nickname = cookieStore.get("nickname")?.value;

  if (!currentPlayerId || !nickname) {
    return <div className="p-6">找不到玩家資訊</div>;
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
            playerId: currentPlayerId,
            nickname: nickname,
            isHost: false,
          }}
          actionsSlot={
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <CopyRoomCodeButton roomCode={room.code} />
                <ResetButton roomId={room.id} />
                <LeaveButton roomId={room.id} />
              </CardContent>
            </Card>
          }
        />
      </div>
    </div>
  );
}
