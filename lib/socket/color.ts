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

export function getAvailableColors(
  allColors: PlayerColor[],
  usedColors: PlayerColor[],
) {
  return allColors.filter((color) => !usedColors.includes(color));
}

export function getRandomColor(colors: PlayerColor[]) {
  if (colors.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export function assignInitialPlayerColor(
  playerId: string,
  playerColors: Record<string, PlayerColor>,
  allColors: readonly PlayerColor[],
): PlayerColor | null {
  if (playerColors[playerId]) {
    return playerColors[playerId];
  }

  const usedKeys = Object.values(playerColors).map((color) => color.key);

  const availableColors = allColors.filter(
    (color) => !usedKeys.includes(color.key),
  );

  if (availableColors.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableColors.length);

  return availableColors[randomIndex];
}

export function getNextRandomPlayerColor(params: {
  playerId: string;
  playerColors: Record<string, PlayerColor>;
  allColors: PlayerColor[];
}) {
  const { playerId, playerColors, allColors } = params;

  const currentColor = playerColors[playerId];

  const usedColorsByOthers = Object.entries(playerColors)
    .filter(([id]) => id !== playerId)
    .map(([, color]) => color);

  const availableColors = getAvailableColors(allColors, usedColorsByOthers);

  const colorsExceptCurrent = availableColors.filter(
    (color) => color !== currentColor,
  );

  return getRandomColor(colorsExceptCurrent);
}
