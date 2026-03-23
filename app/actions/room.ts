"use server";

import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createRoom(nickname: string) {
  const trimmedNickname = nickname.trim();

  if (!trimmedNickname) {
    return { error: "請輸入暱稱" };
  }

  let attempts = 0;

  while (attempts < 5) {
    const code = generateRoomCode();

    try {
      const room = await prisma.room.create({
        data: {
          code,
          players: {
            create: {
              nickname: trimmedNickname,
              isHost: true,
            },
          },
        },
      });

      return { success: true, roomCode: room.code };
    } catch (error) {
      attempts++;

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      console.error("createRoom unexpected error:", error);
      return { error: "建立房間失敗，請稍後再試" };
    }
  }

  return { error: "建立房間失敗，請稍後再試" };
}

export async function joinRoom(roomCode: string, nickname: string) {
  const trimmedRoomCode = roomCode.trim().toUpperCase();
  const trimmedNickname = nickname.trim();

  if (!trimmedNickname) {
    return { error: "請輸入暱稱" };
  }

  if (!trimmedRoomCode) {
    return { error: "請輸入房號" };
  }

  const room = await prisma.room.findUnique({
    where: { code: trimmedRoomCode },
    include: {
      players: true,
    },
  });

  if (!room) {
    return { error: "房間不存在" };
  }

  if (room.players.length >= 4) {
    return { error: "房間已滿" };
  }

  const duplicateNickname = room.players.some(
    (player) => player.nickname.toLowerCase() === trimmedNickname.toLowerCase(),
  );

  if (duplicateNickname) {
    return { error: "此暱稱已被使用" };
  }

  await prisma.player.create({
    data: {
      nickname: trimmedNickname,
      roomId: room.id,
      isHost: false,
    },
  });

  return { success: true, roomCode: room.code };
}
