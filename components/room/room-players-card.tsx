"use client";

import clsx from "clsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type Player = {
  id: string;
  nickname: string;
};

type PlayerColorMap = Record<
  string,
  {
    dot: string;
    ring: string;
    bg?: string;
  }
>;

type PlayersCardProps = {
  players: Player[];
  currentPlayerId: string;
  playerColorMap: PlayerColorMap;
};

export function PlayersCard({
  players,
  currentPlayerId,
  playerColorMap,
}: PlayersCardProps) {
  return (
    <>
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
                  <span
                    className={clsx(
                      "h-3 w-3 rounded-full",
                      color?.dot ?? "bg-gray-400",
                    )}
                  />{" "}
                  <span className="font-medium">{player.nickname}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
