"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlayerStore } from "@/app/store/use-player-store";
import { createRoomAction, joinRoomAction } from "@/app/actions/player-session";

type Step = "input" | "action" | "join";

export function LobbyPage() {
  const router = useRouter();
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const playerNickname = usePlayerStore((state) => state.nickname);

  const [step, setStep] = useState<Step>("input");
  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [error, setError] = useState("");
  const [joinError, setJoinError] = useState("");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (playerNickname) {
      setNickname(playerNickname);
      setTempNickname(playerNickname);
      setStep("action");
    }
  }, [playerNickname]);

  const handleConfirmNickname = () => {
    const trimmedNickname = tempNickname.trim();

    if (!trimmedNickname) {
      setError("請輸入暱稱");
      return;
    }

    setNickname(trimmedNickname);
    setError("");
    setStep("action");
  };

  const handleJoinClick = () => {
    setJoinError("");
    setStep("join");
  };

  const handleCreateRoom = () => {
    if (!nickname.trim()) {
      setError("請先輸入暱稱");
      setStep("input");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nickname", nickname);

      const result = await createRoomAction(formData);

      if ("error" in result) {
        setError(result.error);
        setStep("input");
        return;
      }

      setPlayer({
        nickname: result.nickname,
        playerId: result.playerId,
        roomId: result.roomId,
        roomCode: result.roomCode,
        isHost: result.isHost,
      });

      router.push(`/room/${result.roomCode}`);
    });
  };

  const handleJoinRoom = () => {
    const trimmedRoomCode = roomCode.trim().toUpperCase();

    if (!trimmedRoomCode) {
      setJoinError("請輸入房號");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nickname", nickname);
      formData.append("roomCode", trimmedRoomCode);

      const result = await joinRoomAction(formData);

      if ("error" in result) {
        setJoinError(result.error);
        return;
      }

      setPlayer({
        nickname: result.nickname,
        playerId: result.playerId,
        roomId: result.roomId,
        roomCode: result.roomCode,
        isHost: result.isHost,
      });

      router.push(`/room/${result.roomCode}`);
    });
  };

  return (
    <Card className="w-full max-w-sm flex flex-col">
      <CardHeader className="items-center text-center space-y-2">
        <CardTitle className="text-2xl font-bold">Artale RJPQ</CardTitle>
        <CardDescription>
          Enter your nickname below to create or join the room
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === "input" && (
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={tempNickname}
                  onChange={(e) => {
                    setTempNickname(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="John"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmNickname();
                    }
                  }}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </div>
          </form>
        )}

        {step === "action" && (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Nickname:{" "}
              <span className="font-bold text-xl text-black">{nickname}</span>
            </p>

            <Button onClick={handleCreateRoom} disabled={isPending}>
              {isPending ? "Loading..." : "Create Room"}
            </Button>

            <Button
              variant="secondary"
              onClick={handleJoinClick}
              disabled={isPending}
            >
              {isPending ? "Loading..." : "Join Room"}
            </Button>
          </div>
        )}

        {step === "join" && (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Nickname:{" "}
              <span className="font-bold text-xl text-black">{nickname}</span>
            </p>

            <div className="grid gap-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <Input
                id="roomCode"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  if (joinError) setJoinError("");
                }}
                placeholder="Enter room code"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleJoinRoom();
                  }
                }}
              />
              {joinError && <p className="text-sm text-red-500">{joinError}</p>}
            </div>
          </div>
        )}
      </CardContent>

      {(step === "input" || step === "join") && (
        <CardFooter>
          {step === "input" && (
            <Button onClick={handleConfirmNickname} className="w-full">
              Confirm
            </Button>
          )}

          {step === "join" && (
            <div className="flex justify-between items-center w-full">
              <Button
                variant="ghost"
                onClick={() => {
                  setJoinError("");
                  setStep("action");
                }}
              >
                ← Back
              </Button>
              <Button onClick={handleJoinRoom} disabled={isPending}>
                {isPending ? "Loading..." : "Confirm Join"}
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
