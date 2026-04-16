import { Card, CardContent } from "../ui/card";

type RoomPlayerPathProps = {
  playerPath: string;
};

export function RoomPlayerPath({ playerPath }: RoomPlayerPathProps) {
  const hasValidPath = playerPath.replace(/[-*\s]/g, "").length > 0;

  if (!hasValidPath) return null;

  return (
    <Card>
      <CardContent>
        <p className="whitespace-pre text-2xl md:text-4xl font-mono tracking-[0.3em] flex justify-center items-center ">
          {playerPath}
        </p>
      </CardContent>
    </Card>
  );
}
