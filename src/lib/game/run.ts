

import fs from "fs";
import path from "path";
import { positions, cratesPerLevel } from "@/lib/game/positions";

export type Run = {
  username: string;
  position: number; 
  level: number; 
  cratesDone: number; 
  points: number; 
  levelPoints: number; 
  lives: number;
  currentCrate: string | null;
  status: "playing" | "choose" | "fired" | "won";
};

export type Event = "continue" | "next-level" | "promoted" | "choose" | "fired" | "won";

const file = path.join(process.cwd(), "data", "runs.json");

const store = globalThis as unknown as { runs?: Map<string, Run> };

function load(): Map<string, Run> {
  if (store.runs) return store.runs;

  const runs = new Map<string, Run>();
  try {
    const saved: Run[] = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const run of saved) {
      run.currentCrate = null; 
      runs.set(run.username, run);
    }
  } catch {
    
  }
  store.runs = runs;
  return runs;
}

function save() {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify([...load().values()], null, 2));
}

export function startRun(username: string): Run {
  const run: Run = {
    username,
    position: 0,
    level: 1,
    cratesDone: 0,
    points: 0,
    levelPoints: 0,
    lives: 3,
    currentCrate: null,
    status: "playing",
  };
  load().set(username, run); 
  save();
  return run;
}

export function getRun(username: string | undefined): Run | undefined {
  if (!username) return undefined;
  return load().get(username);
}

// points for a correct decision: 100 plus a bonus for the time left
export function pointsFor(secondsLeft: number): number {
  return 100 + secondsLeft;
}

function promote(run: Run): Event {
  if (run.position + 1 >= positions.length) {
    run.status = "won";
    return "won";
  }
  run.position++;
  run.level = 1;
  run.cratesDone = 0;
  run.points = 0;
  run.levelPoints = 0;
  run.lives = 3;
  return "promoted";
}

function play(run: Run, correct: boolean, secondsLeft: number): Event {
  run.currentCrate = null;

  if (correct) {
    const earned = pointsFor(secondsLeft);
    run.points += earned;
    run.levelPoints += earned;
  } else {
    run.lives--;
    if (run.lives <= 0) {
      run.status = "fired";
      return "fired";
    }
  }

  run.cratesDone++;
  if (run.cratesDone < cratesPerLevel) return "continue";

  const position = positions[run.position];
  if (run.level < position.tanksPerLevel.length) {
    run.level++;
    run.cratesDone = 0;
    run.levelPoints = 0;
    return "next-level";
  }

  if (run.points >= position.pointsToPromote) return promote(run);

  run.status = "choose";
  return "choose";
}

export function applyResult(run: Run, correct: boolean, secondsLeft: number): Event {
  const event = play(run, correct, secondsLeft);
  save();
  return event;
}

export function choose(run: Run, action: "replay" | "restart"): boolean {
  if (run.status !== "choose") return false;

  if (action === "replay") {
    run.points -= run.levelPoints; 
  } else {
    run.level = 1;
    run.points = 0;
  }

  run.levelPoints = 0;
  run.cratesDone = 0;
  run.lives = 3;
  run.status = "playing";
  save();
  return true;
}

export function publicRun(run: Run) {
  const position = positions[run.position];
  return {
    position: position.name,
    level: run.level,
    levelCount: position.tanksPerLevel.length,
    cratesDone: run.cratesDone,
    cratesPerLevel,
    points: run.points,
    pointsToPromote: position.pointsToPromote,
    lives: run.lives,
    status: run.status,
  };
}