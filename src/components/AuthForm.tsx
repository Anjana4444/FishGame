"use client";

// Log in / create account form, styled like a paper form on the desk.
// Written with some help from AI.

import { useState } from "react";

export type User = {
  username: string;
  role: string;
  totalPoints: number;
  bestPosition: string;
};

export default function AuthForm({ onDone }: { onDone: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(action: "login" | "signup") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, username, password }),
      });
      const data = await res.json();
      if (res.ok) onDone(data.user);
      else setError(data.error);
    } catch {
      setError("Could not reach the server.");
    }
    setBusy(false);
  }

  const input =
    "mb-4 w-full rounded-sm border-2 border-ink/40 bg-white/60 px-3 py-2 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-water";
  const button =
    "font-display text-xl tracking-wide rounded-sm px-5 py-2 disabled:opacity-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-water";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send("login");
      }}
      className="max-w-sm rounded-sm bg-paper p-6 text-ink shadow-lg"
    >
      <p className="mb-4 text-lg">Log in to your desk, or create an account if this is your first shift.</p>

      <label htmlFor="username" className="mb-1 block">
        Username
      </label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        className={input}
      />

      <label htmlFor="password" className="mb-1 block">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        className={input}
      />

      {error && (
        <p role="alert" className="mb-4 font-bold text-reject">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className={`${button} bg-ink text-paper hover:bg-water`}>
          Log in
        </button>
        <button
          type="button"
          onClick={() => send("signup")}
          disabled={busy}
          className={`${button} border-2 border-ink hover:bg-ink/10`}
        >
          Create account
        </button>
      </div>
    </form>
  );
}