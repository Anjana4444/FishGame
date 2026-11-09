// Builds a crate: gets the tanks from the Fish API and writes the paperwork.
// Written with some help from AI.

import { randomUUID } from "crypto";
import { getTank } from "@/lib/fish/fishApi";
import { positions } from "@/lib/game/positions";

// what the browser gets to see
export type Crate = {
  id: string;
  images: string[];
  claim: number;
  seconds: number;
};

// what only the server knows
type Secret = { total: number; claim: number; deadline: number };

// stored on globalThis so it survives hot reload while developing
const store = globalThis as unknown as { crateSecrets?: Map<string, Secret> };
const secrets = (store.crateSecrets ??= new Map<string, Secret>());

function makeClaim(total: number, cheatChance: number): number {
  if (Math.random() > cheatChance) return total; // honest crate

  let diff = 1 + Math.floor(Math.random() * 3);
  if (Math.random() < 0.5) diff = -diff;

  let claim = total + diff;
  if (claim < 1) claim = total + 1;
  return claim;
}

export async function createCrate(positionIndex: number, level: number): Promise<Crate> {
  const position = positions[positionIndex];
  const tankCount = position.tanksPerLevel[level - 1];

  // one Fish API call per tank, all at once
  const tanks = await Promise.all(
    Array.from({ length: tankCount }, () => getTank()),
  );

  let total = 0;
  for (const tank of tanks) total += tank.count;

  const claim = makeClaim(total, position.cheatChance);
  const seconds = tankCount * position.secondsPerTank + 10;
  const id = randomUUID();

  secrets.set(id, { total, claim, deadline: Date.now() + seconds * 1000 });

  // the real total is not sent to the browser
  return { id, images: tanks.map((t) => t.image), claim, seconds };
}