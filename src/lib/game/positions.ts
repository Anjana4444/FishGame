// Positions the player can reach. Change the numbers here to balance the game.

export type Cheat = "miscount" | "paper";

export type Position = {
  name: string;
  tanksPerLevel: number[]; // tanks in each crate, one entry per level
  cheatChance: number; // chance a crate is not honest
  cheats: Cheat[]; // the kinds of cheating this position can see
  decoyChance: number; // chance an honest crate still has a harmless paper fish on it
  secondsPerTank: number;
  pointsToPromote: number; // points needed to move up from this position
};

export const cratesPerLevel = 3;

export const positions: Position[] = [
  {
    name: "Trainee",
    tanksPerLevel: [1, 1, 2, 2], // 4 levels
    cheatChance: 0.3,
    cheats: ["miscount", "paper"],
    decoyChance: 0.2,
    secondsPerTank: 20,
    pointsToPromote: 1250,
  },
  {
    name: "Inspector",
    tanksPerLevel: [2, 2, 3, 3],
    cheatChance: 0.4,
    cheats: ["miscount", "paper"],
    decoyChance: 0.3,
    secondsPerTank: 18,
    pointsToPromote: 1350,
  },
  {
    name: "Chief",
    tanksPerLevel: [3, 3, 4, 4],
    cheatChance: 0.5,
    cheats: ["miscount", "paper"],
    decoyChance: 0.4,
    secondsPerTank: 15,
    pointsToPromote: 0, // last position, nothing above it
  },
];