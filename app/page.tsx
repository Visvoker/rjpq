import { LobbyPage } from "@/components/lobby-entry";

export default async function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-300">
      <LobbyPage />
    </main>
  );
}
