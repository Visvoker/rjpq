export const PLAYER_COLOR_CLASSES = [
  {
    key: "red",
    dot: "bg-red-500",
    cell: "bg-red-500 border-red-500 text-white",
    ring: "ring-red-500",
  },
  {
    key: "blue",
    dot: "bg-blue-500",
    cell: "bg-blue-500 border-blue-500 text-white",
    ring: "ring-blue-500",
  },
  {
    key: "green",
    dot: "bg-green-500",
    cell: "bg-green-500 border-green-500 text-white",
    ring: "ring-green-500",
  },
  {
    key: "amber",
    dot: "bg-amber-400",
    cell: "bg-amber-400 border-amber-400 text-black",
    ring: "ring-amber-400",
  },
  {
    key: "violet",
    dot: "bg-violet-500",
    cell: "bg-violet-500 border-violet-500 text-white",
    ring: "ring-violet-500",
  },
  {
    key: "cyan",
    dot: "bg-cyan-500",
    cell: "bg-cyan-500 border-cyan-500 text-white",
    ring: "ring-cyan-500",
  },
] as const;

export type PlayerColor = (typeof PLAYER_COLOR_CLASSES)[number];

export function createPlayerColorMap(
  players: { id: string }[],
): Record<string, PlayerColor> {
  return Object.fromEntries(
    players.map((player, index) => [
      player.id,
      PLAYER_COLOR_CLASSES[index % PLAYER_COLOR_CLASSES.length],
    ]),
  );
}

export function getPlayerColor(
  playerId: string,
  map: Record<string, PlayerColor>,
) {
  return map[playerId];
}

export function getAvailableColors(usedKeys: string[]) {
  return PLAYER_COLOR_CLASSES.filter((color) => !usedKeys.includes(color.key));
}

export function getRandomAvailableColor(
  usedKeys: string[],
): PlayerColor | null {
  const available = getAvailableColors(usedKeys);

  if (available.length === 0) return null;

  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

export function rerollPlayerColor(
  playerId: string,
  playerColorMap: Record<string, PlayerColor>,
): Record<string, PlayerColor> {
  const usedKeys = Object.entries(playerColorMap)
    .filter(([id]) => id !== playerId)
    .map(([, color]) => color.key);

  const nextColor = getRandomAvailableColor(usedKeys);

  if (!nextColor) return playerColorMap;

  return {
    ...playerColorMap,
    [playerId]: nextColor,
  };
}
