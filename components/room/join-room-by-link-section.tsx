"use client";

import { useState, useTransition } from "react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { joinRoomAction } from "@/app/actions/player-session";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "@/app/store/use-player-store";

type JoinRoomByLinkSectionProps = {
  roomCode: string;
};

export function JoinRoomByLinkSection({
  roomCode,
}: JoinRoomByLinkSectionProps) {
  const router = useRouter();

  const nickname = usePlayerStore((state) => state.nickname);
  const setNickname = usePlayerStore((state) => state.setNickname);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);

  const [nicknameError, setNicknameError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleJoinRoom = () => {
    const trimmedNickname = nickname.trim();
    const trimmedRoomCode = roomCode.trim().toUpperCase();

    if (!trimmedNickname) {
      setNicknameError("請輸入暱稱");
      return;
    }

    if (trimmedNickname.length > 16) {
      setNicknameError("暱稱最多 16 個字");
      return;
    }

    setNicknameError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nickname", trimmedNickname);
      formData.append("roomCode", trimmedRoomCode);

      const result = await joinRoomAction(formData);

      if ("error" in result) {
        setNicknameError(result.error ?? "");
        return;
      }

      setNickname(trimmedNickname);

      router.push(`/room/${result.roomCode}`);
      router.refresh();
    });
  };

  if (!hasHydrated) {
    return null;
  }

  return (
    <>
      <Card className="flex w-full max-w-sm flex-col">
        <CardHeader className="items-center space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Artale RJPQ</CardTitle>
          <CardDescription>
            Enter your nickname below to join the room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="nickname">Nickname</Label>
              {nickname && (
                <span className="text-xs text-muted-foreground">
                  {nickname.length}/16
                </span>
              )}
            </div>

            <Input
              id="nickname"
              value={nickname}
              maxLength={16}
              onChange={(e) => {
                setNickname(e.target.value);
                if (nicknameError) setNicknameError("");
              }}
              placeholder="John"
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleJoinRoom();
                }
              }}
            />

            {nicknameError && (
              <p className="text-sm text-red-500">{nicknameError}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            onClick={handleJoinRoom}
            className="w-full"
            disabled={isPending}
          >
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
