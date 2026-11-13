
export type Cheat = "miscount" | "paper";

export type Position = {
  name: string;
  tanksPerLevel: number[]; 
  cheatChance: number; 
  cheats: Cheat[]; 
  decoyChance: number; 
  secondsPerTank: number;
  pointsToPromote: number; 
};

export const cratesPerLevel = 3;

export const positions: Position[] = [
  {
    name: "Trainee",
    tanksPerLevel: [1, 1, 2, 2], 
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
    pointsToPromote: 0, 
  },
];