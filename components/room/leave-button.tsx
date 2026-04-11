"use client";

import { clearRoomSessionAction } from "@/app/actions/player-session";
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
import { useRouter } from "next/navigation";

export function LeaveButton() {
  const router = useRouter();

  const handleLeave = async () => {
    const socket = getSocket();

    socket.emit("leave-room");

    await new Promise((resolve) => setTimeout(resolve, 100));

    await clearRoomSessionAction();

    router.push("/");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex-1">
          離開房間
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確定要離開房間嗎？</AlertDialogTitle>
          <AlertDialogDescription>
            離開後將清除你的資料並返回首頁
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>

            <AlertDialogAction onClick={handleLeave} type="button">
              確定離開
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
