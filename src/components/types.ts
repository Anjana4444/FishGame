// Types shared by the screens.

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

// a question to ask the player before doing something they can't undo
export type Question = {
  title: string;
  text: string;
  yes: string; // label of the confirm button
  onYes: () => void;
};