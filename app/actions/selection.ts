"use server";

import { prisma } from "@/lib/db";

type SelectSlotInput = {
  roomId: string;
  playerId: string;
  floor: number;
  slot: number;
};

type SelectSlotResult = { success: true } | { success: false; error: string };

export async function selectSlot({
  roomId,
  playerId,
  floor,
  slot,
}: SelectSlotInput): Promise<SelectSlotResult> {
  try {
    if (!roomId || !playerId) {
      return { success: false, error: "缺少房間或玩家資料" };
    }

    if (floor < 1 || floor > 10) {
      return { success: false, error: "樓層錯誤" };
    }

    if (slot < 1 || slot > 4) {
      return { success: false, error: "位置錯誤" };
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return { success: false, error: "找不到玩家" };
    }

    if (player.roomId !== roomId) {
      return { success: false, error: "玩家不在這個房間內" };
    }

    await prisma.$transaction(async (tx) => {
      const occupied = await tx.selection.findUnique({
        where: {
          roomId_floor_slot: {
            roomId,
            floor,
            slot,
          },
        },
      });

      if (occupied && occupied.playerId !== playerId) {
        throw new Error("這個位置已經被其他玩家選走了");
      }

      await tx.selection.upsert({
        where: {
          playerId_floor: {
            playerId,
            floor,
          },
        },
        update: {
          slot,
        },
        create: {
          roomId,
          playerId,
          floor,
          slot,
        },
      });
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "選取失敗" };
  }
}
