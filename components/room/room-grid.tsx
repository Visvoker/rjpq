"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectSlot } from "@/app/actions/selection";
import clsx from "clsx";
import { PlayerColor } from "@/lib/color";

type Selection = {
  id: string;
  roomId: string;
  playerId: string;
  floor: number;
  slot: number;
};

type RoomGridProps = {
  roomId: string;
  currentPlayerId: string;
  selections: Selection[];
  playerColorMap: Record<string, PlayerColor>;
};

export function RoomGrid({
  roomId,
  currentPlayerId,
  selections,
  playerColorMap,
}: RoomGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const floors = Array.from({ length: 10 }, (_, floorIndex) => ({
    floor: floorIndex + 1,
    slots: Array.from({ length: 4 }, (_, slotIndex) => slotIndex + 1),
  }));

  const handleSelect = async (floor: number, slot: number) => {
    setError("");

    startTransition(async () => {
      const result = await selectSlot({
        roomId,
        playerId: currentPlayerId,
        floor,
        slot,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {floors.map((floorItem) => (
        <div
          key={floorItem.floor}
          className="grid grid-cols-[60px_1fr] items-center gap-2"
        >
          <div className="text-sm font-medium text-muted-foreground">
            {11 - floorItem.floor}F
          </div>

          <div className="grid grid-cols-4 gap-2">
            {floorItem.slots.map((slot) => {
              const selection = selections.find(
                (item) => item.floor === floorItem.floor && item.slot === slot,
              );
              const ownerColor = selection
                ? playerColorMap[selection.playerId]
                : null;

              const isMine = selection?.playerId === currentPlayerId;
              const isOccupiedByOther =
                !!selection && selection.playerId !== currentPlayerId;

              return (
                <button
                  key={`${floorItem.floor}-${slot}`}
                  type="button"
                  disabled={isPending || isOccupiedByOther}
                  onClick={() => handleSelect(floorItem.floor, slot)}
                  className={clsx(
                    "aspect-square max-w-[40px] sm:max-w-[50px] rounded-lg border shadow-sm transition",
                    selection
                      ? ownerColor?.cell
                      : "bg-background hover:bg-accent hover:text-accent-foreground",
                    isMine && ownerColor?.ring,
                  )}
                >
                  {}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
