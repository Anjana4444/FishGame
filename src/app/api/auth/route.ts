import { NextResponse } from "next/server";
import { createUser, verifyLogin, type User } from "@/lib/auth/users";
import { createSession, endSession, getCurrentUser } from "@/lib/auth/session";
import { positions } from "@/lib/game/positions";

function publicUser(user: User) {
  return {
    username: user.username,
    role: user.role,
    totalPoints: user.totalPoints,
    bestPosition: positions[user.highestPosition].name,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user: user ? publicUser(user) : null });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (body.action === "signup") {
    const error = createUser(username, password);
    if (error) return NextResponse.json({ error }, { status: 400 });
  }

  if (body.action === "signup" || body.action === "login") {
    const user = verifyLogin(username, password);
    if (!user) {
      return NextResponse.json({ error: "Wrong username or password." }, { status: 401 });
    }
    await createSession(user.username);
    return NextResponse.json({ user: publicUser(user) });
  }

  if (body.action === "logout") {
    await endSession();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}