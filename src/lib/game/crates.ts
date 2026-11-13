

import { randomUUID } from "crypto";
import { getTank } from "@/lib/fish/fishApi";
import { positions } from "@/lib/game/positions";

export type Crate = {
  id: string;
  tanks: { image: string; items: string[] }[]; 
  claim: number;
  seconds: number;
};

type Kind = "honest" | "miscount" | "paper";
type Secret = { total: number; claim: number; kind: Kind; deadline: number };

const store = globalThis as unknown as { crateSecrets?: Map<string, Secret> };
const secrets = (store.crateSecrets ??= new Map<string, Secret>());


function randomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
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
      const paperFish = 1 + Math.floor(Math.random() * 2); 
      addPaperFish(tanks, paperFish);
      claim = total + paperFish;
    }
  } else if (Math.random() < position.decoyChance) {
    addPaperFish(tanks, 1);
  }
  

  const seconds = tankCount * position.secondsPerTank + 10;
  const id = randomUUID();

  secrets.set(id, { total, claim, kind, deadline: Date.now() + seconds * 1000 });

  return { id, tanks, claim, seconds };
}

export function judgeCrate(id: string, approve: boolean | null) {
  const secret = secrets.get(id);
  if (!secret) return null;
  secrets.delete(id); 

  const msLeft = secret.deadline - Date.now();
  const onTime = msLeft > -1000; 
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