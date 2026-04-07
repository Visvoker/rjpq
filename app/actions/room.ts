"use server";

import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
        },
      });

      const playerId = crypto.randomUUID();

      return {
        success: true,
        nickname: trimmedNickname,
        playerId: playerId,
        roomId: room.id,
        roomCode: room.code,
        isHost: true,
      };
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

  return { error: "建立房間失敗，請稍後再試123" };
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
  });

  if (!room) {
    return { error: "房間不存在" };
  }

  const playerId = crypto.randomUUID();

  return {
    success: true,
    nickname: trimmedNickname,
    playerId,
    roomId: room.id,
    roomCode: room.code,
    isHost: false,
  };
}

// export async function resetRoom() {
//   const cookieStore = await cookies();
//   const playerId = cookieStore.get("playerId")?.value;

//   if (!playerId) {
//     throw new Error("為登入玩家");
//   }

//   const player = await prisma.player.findUnique({
//     where: { id: playerId },
//     include: { room: true },
//   });

//   if (!player) {
//     throw new Error("玩家不存在");
//   }

//   if (!player.isHost) {
//     throw new Error("只有房主可以重置");
//   }

//   await prisma.selection.deleteMany({
//     where: {
//       roomId: player.roomId,
//     },
//   });

//   // 讓畫面更新
//   revalidatePath(`/room/${player.room.code}`);

//   return { success: true };
// }

// export async function leaveRoom() {
//   const cookieStore = await cookies();
//   const playerId = cookieStore.get("playerId")?.value;

//   if (!playerId) {
//     redirect("/");
//   }

//   const player = await prisma.player.findUnique({
//     where: { id: playerId },
//     include: { room: true },
//   });

//   if (!player) {
//     cookieStore.delete("playerId");
//     redirect("/");
//   }

//   const roomId = player.roomId;
//   const isHost = player.isHost;

//   await prisma.$transaction(async (tx) => {
//     // 刪自己選擇
//     await tx.selection.deleteMany({
//       where: { playerId },
//     });

//     // 刪自己
//     await tx.player.delete({
//       where: { id: playerId },
//     });

//     const remainingPlayers = await tx.player.findMany({
//       where: { roomId },
//       orderBy: { createdAt: "asc" },
//     });

//     // 房間沒人 → 刪掉
//     if (remainingPlayers.length === 0) {
//       await tx.room.delete({
//         where: { id: roomId },
//       });
//       return;
//     }

//     // host 轉移
//     if (isHost) {
//       await tx.player.update({
//         where: { id: remainingPlayers[0].id },
//         data: { isHost: true },
//       });
//     }
//   });

//   // 清 cookie
//   cookieStore.delete("playerId");
//   cookieStore.delete("roomId");
//   cookieStore.delete("roomCode");
//   cookieStore.delete("nickname");

//   redirect("/");
// }
