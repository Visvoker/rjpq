import { prisma } from "@/lib/db";

export async function getRoomByCode(code: string) {
  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return null;
  }

  try {
    const room = await prisma.room.findUnique({
      where: { code: trimmedCode },
    });

    return room;
  } catch (error) {
    console.error("getRoomByCode error:", error);
    return null;
  }
}

export async function deleteRoomById(roomId: string) {
  console.log({ deleteRoom: roomId });
  try {
    await prisma.room.delete({
      where: { id: roomId },
    });
  } catch (error) {
    console.error("deleteRoomById error:", error);
  }
}
