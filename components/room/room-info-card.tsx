"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type RoomInfoCardProps = {
  roomCode: string;
  hostNickname: string;
  playerCount: number;
};

export function RoomInfoCard({
  roomCode,
  hostNickname,
  playerCount,
}: RoomInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">房號</span>
          <span className="font-medium">{roomCode}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">房主</span>
          <span className="font-medium">
            {hostNickname ? hostNickname : "無"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">玩家數</span>
          <span className="font-medium">{playerCount}/4</span>
        </div>
      </CardContent>
    </Card>
  );
}
