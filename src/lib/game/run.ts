// Keeps track of one player's progress through the game, on the server.
// Runs are saved in data/runs.json, so a server restart does not lose them.
// Written with some help from AI.

import fs from "fs";
import path from "path";
import { positions, cratesPerLevel } from "@/lib/game/positions";

export type Run = {
  username: string;
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

const file = path.join(process.cwd(), "data", "runs.json");

// kept in memory after the first read
const store = globalThis as unknown as { runs?: Map<string, Run> };

function load(): Map<string, Run> {
  if (store.runs) return store.runs;

  const runs = new Map<string, Run>();
  try {
    const saved: Run[] = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const run of saved) {
      run.currentCrate = null; // crates are not saved, so an old one can no longer be answered
      runs.set(run.username, run);
    }
  } catch {
    // no file yet
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
  load().set(username, run); // a player has one run at a time
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

// Called after every crate. Updates points, lives and level, then saves.
export function applyResult(run: Run, correct: boolean, secondsLeft: number): Event {
  const event = play(run, correct, secondsLeft);
  save();
  return event;
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
  save();
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