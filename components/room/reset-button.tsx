"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket/client";
import { toast } from "sonner";

type ResetButtonProps = {
  roomId: string;
};

export function ResetButton({ roomId }: ResetButtonProps) {
  const handleReset = () => {
    const socket = getSocket();

    socket.emit("reset-room", { roomId });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default" className="flex-1">
          重置全部
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要重置嗎？</AlertDialogTitle>
          <AlertDialogDescription>
            這會清除所有玩家的選擇
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleReset}
              type="button"
              variant="default"
            >
              確定重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
