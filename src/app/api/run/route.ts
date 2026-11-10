import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { startRun, getRun, choose, publicRun } from "@/lib/game/run";

// GET /api/run: where is the player right now?
export async function GET() {
  const run = getRun((await cookies()).get("run")?.value);
  return NextResponse.json({ run: run ? publicRun(run) : null });
}

// POST /api/run with { action: "start" | "replay" | "restart" }
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (body.action === "start") {
    const run = startRun();
    const response = NextResponse.json({ run: publicRun(run) });
    response.cookies.set("run", run.id, { httpOnly: true, sameSite: "lax", path: "/" });
    return response;
  }

  if (body.action === "replay" || body.action === "restart") {
    const run = getRun((await cookies()).get("run")?.value);
    if (!run || !choose(run, body.action)) {
      return NextResponse.json({ error: "Nothing to choose right now" }, { status: 400 });
    }
    return NextResponse.json({ run: publicRun(run) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}