import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { topPlayers } from "@/lib/auth/users";
import { positions } from "@/lib/game/positions";

// GET /api/leaderboard: the top 10 players
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first" }, { status: 401 });

  const players = topPlayers(10).map((p, i) => ({
    rank: i + 1,
    username: p.username,
    position: positions[p.highestPosition].name,
    points: p.totalPoints,
    you: p.username === user.username, // worked out here, on the server
  }));

  return NextResponse.json({ players });
}