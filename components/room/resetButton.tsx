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

export function ResetButton({ action }: { action: () => Promise<void> }) {
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

        {/* 🔥 這裡才是真正 submit */}
        <form action={action}>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>

            <AlertDialogAction type="submit" variant="default">
              確定重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
