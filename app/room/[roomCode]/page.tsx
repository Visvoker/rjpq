import clsx from "clsx";
import { cookies } from "next/headers";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomGrid } from "@/components/room/room-grid";

import { getRoomByCode } from "@/app/data/room";
import { createPlayerColorMap } from "@/lib/color";
import { leaveRoom, resetRoom } from "@/app/actions/room";
import { ResetButton } from "@/components/room/resetButton";
import { LeaveButton } from "@/components/room/leaveButton";
import { CopyRoomCodeButton } from "@/components/room/copyButton";
import { Children } from "react";

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
  const playerColorMap = createPlayerColorMap(players);

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

  const host = players.find((player) => player.isHost);

  async function handleReset() {
    "use server";
    await resetRoom();
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:px-2">
          {/* 左邊 */}
          <Card className="w-full md:col-span-1 md:h-full">
            <CardHeader className="hidden md:block">
              <CardTitle>Route Board</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col justify-between">
              <div className="space-y-3">
                <RoomGrid
                  roomId={room.id}
                  currentPlayerId={currentPlayerId}
                  selections={room.selections}
                  playerColorMap={playerColorMap}
                />
              </div>
            </CardContent>
          </Card>

          {/* 右邊 */}

          <div className="space-y-6 h-full md:col-span-1 ">
            <Card>
              <CardHeader>
                <CardTitle>Room Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">房號</span>
                  <span className="font-medium">{room.code}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">房主</span>
                  <span className="font-medium">
                    {host ? host.nickname : "無"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">玩家數</span>
                  <span className="font-medium">{players.length}/4</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3 flex-wrap">
                {players.map((player) => {
                  const color = playerColorMap[player.id];
                  const isCurrentPlayer = player.id === currentPlayerId;

                  return (
                    <div
                      key={player.id}
                      className={clsx(
                        "flex items-center justify-between rounded-lg border bg-background px-3 py-2 transition",
                        isCurrentPlayer && `ring-2 ${color.ring}`,
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${color.dot}`} />
                        <span className="font-medium">{player.nickname}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <CopyRoomCodeButton roomCode={room.code} />

                {currentPlayer.isHost && <ResetButton action={handleReset} />}

                <LeaveButton action={handleLeave} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
