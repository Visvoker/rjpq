import { Card, CardHeader, CardContent } from "../ui/card";
import { CopyRoomCodeButton } from "./copy-button";
import { LeaveButton } from "./leave-button";
import { ResetButton } from "./reset-button";

type RoomActionsCardProps = {
  roomCode: string;
  playerPath?: string;
  showPath?: boolean;
};

export function RoomActionsCard({
  roomCode,
  playerPath,
  showPath = false,
}: RoomActionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-center gap-20 md:hidden">
        {showPath && playerPath && /\d/.test(playerPath) ? (
          <p className="whitespace-pre text-2xl font-mono tracking-[0.3em]">
            {playerPath}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex gap-3">
        <CopyRoomCodeButton roomCode={roomCode} />
        <ResetButton roomId={roomCode} />
        <LeaveButton />
      </CardContent>
    </Card>
  );
}
