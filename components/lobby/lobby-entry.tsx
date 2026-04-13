"use client";

import { useRouter } from "next/navigation";
import { Pen } from "lucide-react";
import { useState, useTransition } from "react";
import { OTPInput } from "input-otp";

import { usePlayerStore } from "@/app/store/use-player-store";
import { createRoomAction, joinRoomAction } from "@/app/actions/player-session";

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

type LobbyView = "nickname" | "menu" | "join";

export function LobbyEntry() {
  const router = useRouter();

  // zustand
  const confirmedNickname = usePlayerStore((state) => state.nickname);
  const setConfirmedNickname = usePlayerStore((state) => state.setNickname);
  const hasHydrated = usePlayerStore((state) => state.hasHydrated);

  // UI state
  const [view, setView] = useState<LobbyView>("menu");
  const [draftNickname, setDraftNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const [nicknameError, setNicknameError] = useState("");
  const [roomCodeError, setRoomCodeError] = useState("");

  const [isPending, startTransition] = useTransition();

  if (!hasHydrated) {
    return null;
  }

  const currentView: LobbyView = confirmedNickname ? view : "nickname";

  // ===== handlers =====

  const handleConfirmNickname = () => {
    const trimmed = draftNickname.trim();

    if (!trimmed) {
      setNicknameError("請輸入暱稱");
      return;
    }

    if (trimmed.length > 16) {
      setNicknameError("暱稱最多 16 個字");
      return;
    }

    setConfirmedNickname(trimmed);
    setDraftNickname(trimmed);
    setNicknameError("");
    setView("menu");
  };

  const handleEditNickname = () => {
    setDraftNickname(confirmedNickname);
    setNicknameError("");
    setRoomCode("");
    setRoomCodeError("");
    setView("nickname");
  };

  const handleOpenJoinView = () => {
    setRoomCodeError("");
    setView("join");
  };

  const handleBackToMenu = () => {
    setRoomCode("");
    setRoomCodeError("");
    setView("menu");
  };

  const handleCreateRoom = () => {
    if (!confirmedNickname.trim()) {
      setNicknameError("請先輸入暱稱");
      setView("nickname");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nickname", confirmedNickname);

      const result = await createRoomAction(formData);

      if ("error" in result) {
        setNicknameError(result.error);
        setView("nickname");
        return;
      }

      router.push(`/room/${result.roomCode}`);
    });
  };

  const handleJoinRoom = () => {
    const trimmedRoomCode = roomCode.trim().toUpperCase();

    if (!confirmedNickname.trim()) {
      setNicknameError("請先輸入暱稱");
      setView("nickname");
      return;
    }

    if (trimmedRoomCode.length !== 6) {
      setRoomCodeError("請輸入完整房號");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("nickname", confirmedNickname);
      formData.append("roomCode", trimmedRoomCode);

      const result = await joinRoomAction(formData);

      if ("error" in result) {
        setRoomCodeError(result.error);
        return;
      }

      router.push(`/room/${result.roomCode}`);
    });
  };

  // ===== views =====

  const renderNicknameView = () => {
    return (
      <>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmNickname();
            }}
          >
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="nickname">Nickname</Label>
                {draftNickname && (
                  <span className="text-xs text-muted-foreground">
                    {draftNickname.length}/16
                  </span>
                )}
              </div>

              <Input
                id="nickname"
                value={draftNickname}
                maxLength={16}
                onChange={(e) => {
                  setDraftNickname(e.target.value);
                  if (nicknameError) setNicknameError("");
                }}
                placeholder="John"
                disabled={isPending}
              />

              {nicknameError && (
                <p className="text-sm text-red-500">{nicknameError}</p>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            onClick={handleConfirmNickname}
            className="w-full"
            disabled={isPending}
          >
            Confirm
          </Button>
        </CardFooter>
      </>
    );
  };

  const renderMenuView = () => {
    return (
      <>
        <CardContent>
          <div className="flex items-center">
            <p className="text-muted-foreground ">
              Nickname:
              <span className="font-bold text-xl text-black ml-1">
                {confirmedNickname}
              </span>
            </p>
            <Button
              variant="ghost"
              onClick={handleEditNickname}
              disabled={isPending}
              size="icon-xs"
              className="ml-1.5 "
            >
              <span className="text-muted-foreground">
                <Pen />
              </span>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <Button
            className="w-auto"
            disabled={isPending}
            onClick={handleCreateRoom}
          >
            {isPending ? "Loading..." : "Create Room"}
          </Button>

          <Button
            className="w-auto"
            variant="secondary"
            onClick={handleOpenJoinView}
            disabled={isPending}
            type="button"
          >
            {isPending ? "Loading..." : "Join Room"}
          </Button>
        </CardFooter>
      </>
    );
  };

  const renderJoinView = () => {
    return (
      <>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Nickname:{" "}
              <span className="font-bold text-xl text-black">
                {confirmedNickname}
              </span>
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinRoom();
              }}
            >
              <OTPInput
                maxLength={6}
                value={roomCode}
                onChange={(value) => {
                  setRoomCode(value.toUpperCase());
                  if (roomCodeError) setRoomCodeError("");
                }}
                containerClassName="flex gap-2 justify-center"
                render={({ slots }) => (
                  <>
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-12 border rounded-md flex items-center justify-center text-lg font-bold focus-within:border-primary"
                      >
                        {slot.char ?? ""}
                      </div>
                    ))}
                  </>
                )}
              />
              {roomCodeError && (
                <p className="text-sm text-red-500">{roomCodeError}</p>
              )}
            </form>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex w-full items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToMenu}
              disabled={isPending}
            >
              ← Back
            </Button>

            <Button onClick={handleJoinRoom} disabled={isPending} type="button">
              {isPending ? "Loading..." : "Confirm Join"}
            </Button>
          </div>
        </CardFooter>
      </>
    );
  };

  // ===== render =====

  return (
    <Card className="flex w-full max-w-sm flex-col">
      <CardHeader className="text-center space-y-2 items-center">
        <CardTitle className="text-2xl font-bold">Artale RJPQ</CardTitle>

        {currentView === "nickname" && (
          <CardDescription>
            Enter your nickname below to create or join the room
          </CardDescription>
        )}
      </CardHeader>

      {currentView === "nickname" && renderNicknameView()}
      {currentView === "menu" && renderMenuView()}
      {currentView === "join" && renderJoinView()}
    </Card>
  );
}
