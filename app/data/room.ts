import { prisma } from "@/lib/db";

export async function getRoomByCode(code: string) {
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return null;
  }

  try {
    const room = await prisma.room.findUnique({
      where: { code: trimmedCode },
      include: {
        players: true,
      },
    });

    return room;
  } catch (error) {
    console.error("getRoomByCode error:", error);
    return null;
  }
}
