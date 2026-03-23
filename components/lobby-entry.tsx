"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { createRoom, joinRoom } from "@/app/actions/room";

export function LobbyEntryPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [tempNickname, setTempNickname] = useState("");
  const [step, setStep] = useState<"input" | "action" | "join">("input");
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joinError, setJoinError] = useState("");

  const [isPending, setIsPending] = useState(false);

  const handleConfirmNickname = () => {
    if (!tempNickname.trim()) {
      setError("Please enter the Nickname ");
      return;
    }

    setError("");
    setNickname(tempNickname.trim());
    setStep("action");
  };

  const handleJoinClick = () => {
    setStep("join");
  };

  const handleCreateRoom = async () => {
    try {
      setIsPending(true);

      const result = await createRoom(nickname);
      console.log(result);

      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(
        `/room/${result.roomCode}?nickname=${encodeURIComponent(nickname)}`,
      );
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setIsPending(true);

      const result = await joinRoom(roomCode, nickname);

      if (result.error) {
        setJoinError(result.error);
        return;
      }

      router.push(
        `/room/${result.roomCode}?nickname=${encodeURIComponent(nickname)}`,
      );
    } catch (error) {
      console.log(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
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
                <Label htmlFor="email">Nickname</Label>
                <Input
                  value={tempNickname}
                  onChange={(e) => {
                    setTempNickname(e.target.value);
                    if (error) setError(""); // 使用者開始輸入就清錯誤
                  }}
                  placeholder="John"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmNickname();
                    }
                  }}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}{" "}
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
            <div></div>
            <Button onClick={handleCreateRoom} disabled={isPending}>
              {isPending ? "Loading..." : "Create Room"}
            </Button>{" "}
            <Button
              variant="secondary"
              onClick={handleJoinClick}
              disabled={isPending}
            >
              {isPending ? "Loading..." : "Join Room"}{" "}
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
                  setRoomCode(e.target.value);
                  if (joinError) setJoinError("");
                }}
                placeholder="Enter room code"
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
              <Button variant="ghost" onClick={() => setStep("action")}>
                ← Back
              </Button>
              <Button onClick={handleJoinRoom}>Confirm Join</Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
