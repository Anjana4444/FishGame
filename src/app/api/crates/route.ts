import { NextResponse, connection } from "next/server";
import { createCrate } from "@/lib/game/crates";
import { positions } from "@/lib/game/positions";

// GET /api/crates?position=0&level=1
export async function GET(request: Request) {
  await connection(); // never cache, every request gets a new crate

  const params = new URL(request.url).searchParams;
  const positionIndex = Number(params.get("position") ?? 0);
  const level = Number(params.get("level") ?? 1);

  const position = positions[positionIndex];
  if (!position || !position.tanksPerLevel[level - 1]) {
    return NextResponse.json({ error: "Unknown position or level" }, { status: 400 });
  }

  try {
    return NextResponse.json(await createCrate(positionIndex, level));
  } catch (error) {
    console.error("Could not build a crate:", error);
    return NextResponse.json(
      { error: "The Fish API is not reachable right now." },
      { status: 502 },
    );
  }
}