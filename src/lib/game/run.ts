// Keeps track of one player's progress through the game, on the server.
// Written with some help from AI.

import { randomUUID } from "crypto";
import { positions, cratesPerLevel } from "@/lib/game/positions";

export type Run = {
  id: string;
  position: number; // index in the positions list
  level: number; // starts at 1
  cratesDone: number; // crates finished in this level
  points: number; // points in this position
  levelPoints: number; // points earned in the current level only
  lives: number;
  currentCrate: string | null;
  status: "playing" | "choose" | "fired" | "won";
};

export type Event = "continue" | "next-level" | "promoted" | "choose" | "fired" | "won";

const store = globalThis as unknown as { runs?: Map<string, Run> };
const runs = (store.runs ??= new Map<string, Run>());

export function startRun(): Run {
  const run: Run = {
    id: randomUUID(),
    position: 0,
    level: 1,
    cratesDone: 0,
    points: 0,
    levelPoints: 0,
    lives: 3,
    currentCrate: null,
    status: "playing",
  };
  runs.set(run.id, run);
  return run;
}

export function getRun(id: string | undefined): Run | undefined {
  if (!id) return undefined;
  return runs.get(id);
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

// Called after every crate. Updates points, lives and level.
export function applyResult(run: Run, correct: boolean, secondsLeft: number): Event {
  run.currentCrate = null;

  if (correct) {
    const earned = 100 + secondsLeft;
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

  // the level is finished
  const position = positions[run.position];
  if (run.level < position.tanksPerLevel.length) {
    run.level++;
    run.cratesDone = 0;
    run.levelPoints = 0;
    return "next-level";
  }

  // it was the last level of this position
  if (run.points >= position.pointsToPromote) return promote(run);

  run.status = "choose";
  return "choose";
}

// The player's choice when they did not get enough points to be promoted.
export function choose(run: Run, action: "replay" | "restart"): boolean {
  if (run.status !== "choose") return false;

  if (action === "replay") {
    run.points -= run.levelPoints; // do not count this level twice
  } else {
    run.level = 1;
    run.points = 0;
  }

  run.levelPoints = 0;
  run.cratesDone = 0;
  run.lives = 3;
  run.status = "playing";
  return true;
}

// What the browser is allowed to see about the run.
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