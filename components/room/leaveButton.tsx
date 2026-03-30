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

export function LeaveButton({ action }: { action: () => Promise<void> }) {
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

        <form action={action}>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>

            <AlertDialogAction type="submit">確定離開</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
