import { prisma } from "@/lib/db";

export async function getPlayersWithRoom() {
  return prisma.player.findMany({
    include: {
      room: true,
    },
  });
}
