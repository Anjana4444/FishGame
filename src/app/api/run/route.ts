import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { startRun, getRun, choose, publicRun } from "@/lib/game/run";

// GET /api/run: where is the player right now?
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first" }, { status: 401 });

  const run = getRun(user.username);
  return NextResponse.json({ run: run ? publicRun(run) : null });
}

// POST /api/run with { action: "start" | "replay" | "restart" }
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  if (body.action === "start") {
    return NextResponse.json({ run: publicRun(startRun(user.username)) });
  }

  if (body.action === "replay" || body.action === "restart") {
    const run = getRun(user.username);
    if (!run || !choose(run, body.action)) {
      return NextResponse.json({ error: "Nothing to choose right now" }, { status: 400 });
    }
    return NextResponse.json({ run: publicRun(run) });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}