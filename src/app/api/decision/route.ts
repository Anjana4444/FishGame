import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { judgeCrate } from "@/lib/game/crates";
import { getRun, applyResult, publicRun } from "@/lib/game/run";

// POST /api/decision with { crateId, approve: true | false | null }
export async function POST(request: Request) {
  const run = getRun((await cookies()).get("run")?.value);
  if (!run) {
    return NextResponse.json({ error: "Start a game first" }, { status: 400 });
  }
  if (run.status !== "playing") {
    return NextResponse.json({ error: "The game is not running" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  if (!run.currentCrate || body.crateId !== run.currentCrate) {
    return NextResponse.json({ error: "That is not your current crate" }, { status: 400 });
  }

  // true = approve, false = reject, anything else = no answer (timer ran out)
  const approve = body.approve === true ? true : body.approve === false ? false : null;

  const verdict = judgeCrate(run.currentCrate, approve);
  if (!verdict) {
    return NextResponse.json({ error: "Crate not found" }, { status: 400 });
  }

  const event = applyResult(run, verdict.correct, verdict.secondsLeft);

  // now that the decision is made, it is fine to show the real numbers
  return NextResponse.json({
    correct: verdict.correct,
    onTime: verdict.onTime,
    wasHonest: verdict.honest,
    claim: verdict.claim,
    total: verdict.total,
    event,
    run: publicRun(run),
  });
}