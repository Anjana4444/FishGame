// Hashing and checking passwords with scrypt (built into Node, no package needed).
// Written with some help from AI.

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// returns "salt:hash", the plain password is never stored
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const attempt = scryptSync(password, salt, 64);
  // timingSafeEqual compares in constant time, so timing can't leak anything
  return timingSafeEqual(attempt, Buffer.from(hash, "hex"));
}