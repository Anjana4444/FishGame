
export type RunInfo = {
  position: string;
  level: number;
  levelCount: number;
  cratesDone: number;
  cratesPerLevel: number;
  points: number;
  pointsToPromote: number;
  lives: number;
  status: "playing" | "choose" | "fired" | "won";
};

export type Question = {
  title: string;
  text: string;
  yes: string; 
  onYes: () => void;
};