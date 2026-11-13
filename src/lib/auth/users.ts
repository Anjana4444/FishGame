

import fs from "fs";
import path from "path";
import { hashPassword, checkPassword } from "@/lib/auth/passwords";

export type User = {
  username: string;
  role: "player" | "admin";
  passwordHash: string;
  totalPoints: number; 
  highestPosition: number; 
};

const file = path.join(process.cwd(), "data", "users.json");

const store = globalThis as unknown as { users?: User[] };

function load(): User[] {
  if (store.users) return store.users;

  let users: User[];
  try {
    users = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    users = []; 
  }
  store.users = users;
  return users;
}

function save() {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(load(), null, 2));
}

export function findUser(username: string): User | undefined {
  return load().find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function createUser(username: string, password: string): string | null {
  if (!/^[A-Za-z0-9_]{3,15}$/.test(username)) {
    return "Username must be 3 to 15 letters, numbers or underscores.";
  }
  if (password.length < 6 || password.length > 100) {
    return "Password must be 6 to 100 characters.";
  }
  if (findUser(username)) {
    return "That username is already taken.";
  }

  const users = load();
  users.push({
    username,
    role: users.length === 0 ? "admin" : "player", 
    passwordHash: hashPassword(password),
    totalPoints: 0,
    highestPosition: 0,
  });
  save();
  return null;
}

export function verifyLogin(username: string, password: string): User | null {
  const user = findUser(username);
  if (!user || !checkPassword(password, user.passwordHash)) return null;
  return user;
}

export function recordProgress(username: string, earned: number, position: number) {
  const user = findUser(username);
  if (!user) return;

  user.totalPoints += earned;
  if (position > user.highestPosition) user.highestPosition = position;
  save();
}

export function topPlayers(limit: number): User[] {
  return [...load()]
    .sort((a, b) => b.highestPosition - a.highestPosition || b.totalPoints - a.totalPoints)
    .slice(0, limit);
}