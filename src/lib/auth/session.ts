

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { findUser, type User } from "@/lib/auth/users";

const cookieName = "session";
const lifetime = 1000 * 60 * 60 * 24 * 7; 

type Session = { username: string; expires: number };

const store = globalThis as unknown as { sessions?: Map<string, Session> };
const sessions = (store.sessions ??= new Map<string, Session>());

export async function createSession(username: string) {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { username, expires: Date.now() + lifetime });

  (await cookies()).set(cookieName, token, {
    httpOnly: true, 
    sameSite: "lax", 
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: lifetime / 1000,
  });
}

export async function getCurrentUser(): Promise<User | undefined> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return undefined;

  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return undefined;
  }
  return findUser(session.username);
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) sessions.delete(token);
  jar.delete(cookieName);
}