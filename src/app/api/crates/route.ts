import { NextResponse, connection } from "next/server";
import { createCrate, judgeCrate } from "@/lib/game/crates";
import { getRun, applyResult, publicRun } from "@/lib/game/run";
import { getCurrentUser } from "@/lib/auth/session";
import { recordProgress } from "@/lib/auth/users";

export async function GET() {
  await connection(); 

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in first" }, { status: 401 });
  }

  const run = getRun(user.username);
  if (!run) {
    return NextResponse.json({ error: "Start a game first" }, { status: 400 });
  }
  if (run.status !== "playing") {
    return NextResponse.json({ error: "The game is not running", run: publicRun(run) }, { status: 409 });
  }


  if (run.currentCrate) {
    judgeCrate(run.currentCrate, null);
    applyResult(run, false, 0);
    recordProgress(user.username, 0, run.position);
    if (run.status !== "playing") {
      return NextResponse.json({ error: "Game over", run: publicRun(run) }, { status: 409 });
    }
  }

  try {
    const crate = await createCrate(run.position, run.level);
    run.currentCrate = crate.id;
    return NextResponse.json({ crate, run: publicRun(run) });
  } catch (error) {
    console.error("Could not build a crate:", error);
    return NextResponse.json(
      { error: "The Fish API is not reachable right now." },
      { status: 502 },
    );
  }
}