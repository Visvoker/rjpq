"use server";

import { cookies } from "next/headers";
import { createRoom, joinRoom } from "./room";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24,
};

export async function createRoomAction(formData: FormData) {
  const nickname = formData.get("nickname")?.toString() ?? "";

  const result = await createRoom(nickname);

  if ("error" in result) {
    return result;
  }

  const cookieStore = await cookies();

  cookieStore.set("nickname", result.nickname, COOKIE_OPTIONS);
  cookieStore.set("playerId", result.playerId, COOKIE_OPTIONS);
  cookieStore.set("roomId", result.roomId, COOKIE_OPTIONS);
  cookieStore.set("roomCode", result.roomCode, COOKIE_OPTIONS);

  return result;
}

export async function joinRoomAction(formData: FormData) {
  const nickname = formData.get("nickname")?.toString() ?? "";
  const roomCode = formData.get("roomCode")?.toString() ?? "";

  const result = await joinRoom(roomCode, nickname);

  if ("error" in result) {
    return result;
  }

  const cookieStore = await cookies();

  cookieStore.set("nickname", result.nickname, COOKIE_OPTIONS);
  cookieStore.set("playerId", result.playerId, COOKIE_OPTIONS);
  cookieStore.set("roomId", result.roomId, COOKIE_OPTIONS);
  cookieStore.set("roomCode", result.roomCode, COOKIE_OPTIONS);

  return result;
}
