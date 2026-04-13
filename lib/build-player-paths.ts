type Selection = {
  id: string;
  floor: number;
  slot: number;
  playerId: string;
};

export function buildPlayerPaths(
  selections: Selection[],
  currentPlayerId: string,
  maxFloor: number = 10,
) {
  const mySelections = selections.filter(
    (selection) => selection.playerId === currentPlayerId,
  );

  const floorMap: Record<number, number> = {};

  for (const selection of mySelections) {
    floorMap[selection.floor] = selection.slot;
  }

  const rawPath = Array.from({ length: maxFloor }, (_, index) => {
    const floor = maxFloor - index;
    return floorMap[floor]?.toString() ?? " ";
  }).join("");

  const result = [];
  const groupSize = 5;

  for (let i = 0; i < rawPath.length; i += groupSize) {
    result.push(rawPath.slice(i, i + groupSize));
  }

  return result.join(" - ");
}
