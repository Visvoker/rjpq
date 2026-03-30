"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyRoomCodeButton({ roomCode }: { roomCode: string }) {
  return (
    <Button
      className="flex-1"
      variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(roomCode);
          toast.success("已複製房號");
        } catch {
          toast.error("複製失敗");
        }
      }}
    >
      複製房號
    </Button>
  );
}
