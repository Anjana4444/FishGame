// Builds a crate: gets the tanks from the Fish API, adds decoys and writes the paperwork.
// Written with some help from AI.

import { randomUUID } from "crypto";
import { getTank } from "@/lib/fish/fishApi";
import { positions } from "@/lib/game/positions";

// what the browser gets to see
export type Crate = {
  id: string;
  tanks: { image: string; items: string[] }[]; // items = things floating on top of a tank
  claim: number;
  seconds: number;
};

// what kind of crate it really is, only the server knows
type Kind = "honest" | "miscount" | "paper";
type Secret = { total: number; claim: number; kind: Kind; deadline: number };

// stored on globalThis so it survives hot reload while developing
const store = globalThis as unknown as { crateSecrets?: Map<string, Secret> };
const secrets = (store.crateSecrets ??= new Map<string, Secret>());


function randomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
// puts paper fish on random tanks
function addPaperFish(tanks: { items: string[] }[], amount: number) {
  for (let i = 0; i < amount; i++) randomItem(tanks).items.push("paper");
}

function wrongClaim(total: number): number {
  let diff = 1 + Math.floor(Math.random() * 3);
  if (Math.random() < 0.5) diff = -diff;

  const claim = total + diff;
  return claim < 1 ? total + 1 : claim;
}

export async function createCrate(positionIndex: number, level: number): Promise<Crate> {
  const position = positions[positionIndex];
  const tankCount = position.tanksPerLevel[level - 1];

  // one Fish API call per tank, all at once
  const fish = await Promise.all(
    Array.from({ length: tankCount }, () => getTank()),
  );

  let total = 0;
  for (const tank of fish) total += tank.count;

  const tanks = fish.map((tank) => ({ image: tank.image, items: [] as string[] }));
    let claim = total;
  let kind: Kind = "honest";

  if (Math.random() < position.cheatChance) {
    kind = randomItem(position.cheats);

    if (kind === "miscount") {
      claim = wrongClaim(total);
    }
    if (kind === "paper") {
      // the cheat padded the paperwork with paper fish
      const paperFish = 1 + Math.floor(Math.random() * 2); // one or two
      addPaperFish(tanks, paperFish);
      claim = total + paperFish;
    }
  } else if (Math.random() < position.decoyChance) {
    // an honest crate that happens to have a paper fish on it, it must not be counted
    addPaperFish(tanks, 1);
  }
  

  const seconds = tankCount * position.secondsPerTank + 10;
  const id = randomUUID();

  secrets.set(id, { total, claim, kind, deadline: Date.now() + seconds * 1000 });

  // the real total and the kind of crate are not sent to the browser
  return { id, tanks, claim, seconds };
}

// Checks the player's decision: true = approve, false = reject, null = no answer.
export function judgeCrate(id: string, approve: boolean | null) {
  const secret = secrets.get(id);
  if (!secret) return null;
  secrets.delete(id); // a crate can only be judged once

  const msLeft = secret.deadline - Date.now();
  const onTime = msLeft > -1000; // 1 second of slack for slow connections
  const honest = secret.kind === "honest";
  const correct = onTime && approve !== null && approve === honest;

  return {
    correct,
    onTime,
    honest,
    kind: secret.kind,
    claim: secret.claim,
    total: secret.total,
    secondsLeft: Math.max(0, Math.floor(msLeft / 1000)),
  };
}