"use client";

import clsx from "clsx";
import { getSocket } from "@/lib/socket/client";
import { PlayerColor } from "@/lib/socket/color";

type Selection = {
  id: string;
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
  const floors = Array.from({ length: 10 }, (_, floorIndex) => ({
    floor: floorIndex + 1,
    slots: Array.from({ length: 4 }, (_, slotIndex) => slotIndex + 1),
  }));

  const handleSelect = (floor: number, slot: number) => {
    const socket = getSocket();

    socket.emit("select-tile", {
      roomId,
      floor,
      slot,
    });
  };

  return (
    <div
      className="
  rounded-xl border bg-card shadow-sm p-6
  md:bg-transparent md:border-0 md:shadow-none md:p-0
"
    >
      <div className="space-y-3">
        {floors.map((floorItem) => (
          <div
            key={floorItem.floor}
            className="grid grid-cols-[50px_1fr] items-center gap-2"
          >
            <div className="text-sm font-medium text-muted-foreground">
              {11 - floorItem.floor}F
            </div>

            <div className="grid grid-cols-4 gap-2">
              {floorItem.slots.map((slot) => {
                const selection = selections.find(
                  (item) =>
                    item.floor === floorItem.floor && item.slot === slot,
                );

                const ownerColor = selection
                  ? playerColorMap[selection.playerId]
                  : undefined;

                const isMine = selection?.playerId === currentPlayerId;

                return (
                  <button
                    key={`${floorItem.floor}-${slot}`}
                    type="button"
                    onClick={() => handleSelect(floorItem.floor, slot)}
                    className={clsx(
                      "aspect-square max-w-[40px] md:max-w-[50px] rounded-lg border shadow-sm transition",
                      selection
                        ? (ownerColor?.cell ?? "bg-muted")
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
    </div>
  );
}
