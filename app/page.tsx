import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRoomByCode } from "./data/room";
import { LobbyEntry } from "@/components/lobby/lobby-entry";

export default async function Home() {
  const cookieStore = await cookies();

  const playerId = cookieStore.get("playerId")?.value;
  const roomCode = cookieStore.get("roomCode")?.value;
  const roomId = cookieStore.get("roomId")?.value;

  if (playerId && roomId && roomCode) {
    const room = await getRoomByCode(roomCode);

    if (room) {
      redirect(`/room/${roomCode}`);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-300">
      <LobbyEntry />
    </main>
  );
}
