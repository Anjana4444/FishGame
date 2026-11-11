"use client";



// Main game screen: shows the crate, the timer and the decision buttons.
// Written with some help from AI.

import { useEffect, useState } from "react";
import Music from "@/components/Music";
import { emit, type GameEvent } from "@/lib/events";
import { setupSounds } from "@/lib/audio/sounds";
import AuthForm, { type User } from "@/components/AuthForm";
import DecoyItem from "@/components/DecoyItem";

type RunInfo = {
  position: string;
  level: number;
  levelCount: number;
  cratesDone: number;
  cratesPerLevel: number;
  points: number;
  pointsToPromote: number;
  lives: number;
  status: "playing" | "choose" | "fired" | "won";
};

type Crate = {
  id: string;
  tanks: { image: string; items: string[] }[];
  claim: number;
  seconds: number;
};

type Result = {
  correct: boolean;
  onTime: boolean;
  wasHonest: boolean;
  kind: string;
  claim: number;
  total: number;
  event: string;
  noAnswer: boolean;
};

const jsonHeaders = { "Content-Type": "application/json" };

// message shown after the crate result, depending on what happened
const eventText: Record<string, string> = {
  "next-level": "Shift complete! You move up to the next level.",
  promoted: "Promotion! You have a new position.",
  choose: "Not enough points for a promotion. Replay this level or start over?",
  fired: "Too many mistakes. You are fired!",
  won: "You reached the top. Well done, Chief!",
};
// why the crate was right or wrong, shown after each decision
const explanations: Record<string, string> = {
  honest: "The paperwork was correct. Paper fish never count.",
  miscount: "The paperwork had the wrong number.",
  paper: "Paper fish were counted as real fish, so the paperwork was too high.",
};
// which big moment makes which sound
const bigEvents: Record<string, GameEvent> = {
  "next-level": "nextLevel",
  promoted: "promoted",
  choose: "choose",
  fired: "fired",
  won: "won",
};

export default function Game() {
  const [run, setRun] = useState<RunInfo | null>(null);
  const [crate, setCrate] = useState<Crate | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [stamp, setStamp] = useState<"approved" | "rejected" | "late">("late");
    const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = still checking

    // when the page opens, find out who is logged in
   useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  // once we know the player, load their game (if they have one)
  useEffect(() => {
    if (!user) return;
    fetch("/api/run")
      .then((res) => res.json())
      .then((data) => setRun(data.run ?? null));
  }, [user]);

  // countdown for the current crate
  useEffect(() => {
    if (!crate || result) return;
    const timer = setInterval(() => {
      const left = Math.ceil((deadline - Date.now()) / 1000);
      setTimeLeft(Math.max(left, 0));
    }, 250);
    return () => clearInterval(timer);
  }, [crate, result, deadline]);

  // time is up: send "no answer"
  useEffect(() => {
    if (crate && !result && !busy && timeLeft === 0) {
      decide(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

    // keyboard shortcuts: A to approve, R to reject
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!crate || result || busy) return;
      if (e.key === "a" || e.key === "A") decide(true);
      if (e.key === "r" || e.key === "R") decide(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crate, result, busy]);

    // connect the sound effects to the game events
  useEffect(() => setupSounds(), []);

  // tick during the last 10 seconds
  useEffect(() => {
    if (crate && !result && timeLeft > 0 && timeLeft <= 10) emit("lowTime");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  async function loadCrate() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/crates");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error);
        if (data.run) setRun(data.run);
        setCrate(null);
      } else {
        setCrate(data.crate);
        setRun(data.run);
        setResult(null);
        setTimeLeft(data.crate.seconds);
        setDeadline(Date.now() + data.crate.seconds * 1000);
      }
    } catch {
      setMessage("Could not reach the server.");
    }
    setBusy(false);
  }

  async function sendAction(action: "start" | "replay" | "restart") {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error);
        setBusy(false);
        return;
      }
      setRun(data.run);
      setResult(null);
      setCrate(null);
    } catch {
      setMessage("Could not reach the server.");
      setBusy(false);
      return;
    }
    setBusy(false);
    await loadCrate();
  }

    async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    setRun(null);
    setCrate(null);
    setResult(null);
    setMessage("");
  }

  async function decide(approve: boolean | null) {
    if (!crate || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/decision", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ crateId: crate.id, approve }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error);
      } else {
        setStamp(approve === true ? "approved" : approve === false ? "rejected" : "late");
        setResult({ ...data, noAnswer: approve === null });
        setRun(data.run);
        if (approve !== null) emit("stamp");
        const outcome: GameEvent = data.correct ? "correct" : approve === null ? "timeUp" : "wrong";
        const big = bigEvents[data.event];
        // a wrong answer should not play the level-up jingle
        emit(big && (data.correct || big !== "nextLevel") ? big : outcome);
      }
    } catch {
      setMessage("Could not reach the server.");
    }
    setBusy(false);
  }

    const share = crate ? Math.min(timeLeft / crate.seconds, 1) : 0;
  const lowTime = timeLeft <= 10;
  const promoShare =
    run && run.pointsToPromote > 0 ? Math.min(run.points / run.pointsToPromote, 1) : 0;

  // what to say under the desk when something big happened
  const note = result
    ? eventText[result.event]
    : run && run.status !== "playing"
      ? eventText[run.status]
      : undefined;

  const stampButton =
    "font-display text-2xl tracking-wide border-4 rounded-sm px-6 py-2 -rotate-2 transition-transform active:scale-95 disabled:opacity-40 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-water";
  const mainButton =
    "font-display text-xl tracking-wide rounded-sm bg-stencil px-6 py-2 text-ink hover:brightness-110 disabled:opacity-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-paper";
  const quietButton =
    "font-display text-xl tracking-wide rounded-sm border-2 border-paper/60 px-6 py-2 hover:bg-paper/10 disabled:opacity-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-paper";

      if (user === undefined) {
    return <main className="min-h-screen bg-harbour p-6 text-paper">Checking your login…</main>;
  }

  if (user === null) {
    return (
      <main className="min-h-screen bg-harbour px-4 py-6 text-paper">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 border-b-2 border-stencil pb-3 font-display text-4xl font-extrabold tracking-wide text-stencil">
            Harbour Inspector
          </h1>
          <AuthForm onDone={setUser} />
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-harbour px-4 py-6 text-paper">
      <div className="mx-auto max-w-4xl">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b-2 border-stencil pb-3">
          <h1 className="font-display text-4xl font-extrabold tracking-wide text-stencil">
            Harbour Inspector
          </h1>

          {run && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="font-display text-xl">
                {run.position}, level {run.level} of {run.levelCount}
              </p>
              <div
                className="flex items-center gap-1"
                role="img"
                aria-label={`Crate ${Math.min(run.cratesDone + 1, run.cratesPerLevel)} of ${run.cratesPerLevel}`}
              >
                {Array.from({ length: run.cratesPerLevel }, (_, i) => (
                  <span
                    key={i}
                    className={`h-4 w-4 border-2 border-stencil ${i < run.cratesDone ? "bg-stencil" : ""}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1" role="img" aria-label={`${run.lives} lives left`}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-5 w-5 rounded-full border-4 ${i < run.lives ? "border-paper" : "border-paper/20"}`}
                  />
                ))}
              </div>
            </div>
          )}
                    <Music />
                              <div className="flex items-center gap-3 text-sm">
            <span>
              {user.username} ({user.role})
            </span>
            <button
              onClick={logout}
              className="rounded-sm border-2 border-paper/60 px-3 py-1 font-display text-lg tracking-wide hover:bg-paper/10 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              Log out
            </button>
          </div>
        </header>

        {run && (
          <div className="mb-5">
            <p className="mb-1 text-sm">
              {run.points} points
              {run.pointsToPromote > 0 && `, ${run.pointsToPromote} needed to be promoted`}
            </p>
            {run.pointsToPromote > 0 && (
              <div className="h-2 overflow-hidden rounded-full bg-paper/15">
                <div className="h-full bg-stencil" style={{ width: `${promoShare * 100}%` }} />
              </div>
            )}
          </div>
        )}

        {message && (
          <p role="alert" className="mb-4 font-bold text-[#f2a9a6]">
            {message}
          </p>
        )}

        {crate && (
          <div className="grid gap-5 md:grid-cols-[3fr_2fr]  md:items-start">
                        <section
              aria-label="Fish tanks"
              className={crate.tanks.length === 1 ? "grid" : "grid grid-cols-2 items-start gap-3"}
            >
              {crate.tanks.map((tank, i) => (
                <figure key={i} className="rounded-md border-4 border-water bg-deep p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tank.image} alt={`Fish tank ${i + 1}`} className="w-full rounded-sm" />
                  {tank.items.length > 0 && (
                    <div className="flex items-end gap-3 px-2 pt-2">
                      {tank.items.map((item, j) => (
                        <div key={j} className={`drop-shadow-md ${j % 2 === 0 ? "-rotate-3" : "rotate-3"}`}>
                          <DecoyItem kind={item} />
                        </div>
                      ))}
                    </div>
                  )}
                  <figcaption className="px-1 pt-1 text-sm text-paper/70">Tank {i + 1}</figcaption>
                </figure>
              ))}
            </section>

            <section aria-label="Paperwork" className="self-start rounded-sm bg-paper p-5 text-ink shadow-lg">
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-ink/15">
                <div
                  className={`h-full ${lowTime && !result ? "bg-reject" : "bg-water"}`}
                  style={{ width: `${share * 100}%`, transition: "width 250ms linear" }}
                />
              </div>

              <p className="text-ink/70">The paperwork says</p>
              <p className="font-display text-8xl font-extrabold leading-none">{crate.claim}</p>
                            <p className="mb-4">
                fish in total, across {crate.tanks.length} {crate.tanks.length === 1 ? "tank" : "tanks"}
              </p>
                                            <p className="mb-4 text-sm text-ink/70">Only real fish count. Paper ones don&apos;t.</p>


              {result ? (
                <div>
                  <p
                    className={`stamp-in inline-block rounded-sm border-4 px-4 py-1 font-display text-3xl ${
                      stamp === "approved"
                        ? "border-approve text-approve"
                        : stamp === "rejected"
                          ? "border-reject text-reject"
                          : "border-ink/60 text-ink/60"
                    }`}
                  >
                    {stamp === "approved" ? "APPROVED" : stamp === "rejected" ? "REJECTED" : "TIME UP"}
                  </p>
                  <p className="mt-3 font-bold">
                    {result.correct ? "Good call." : result.noAnswer ? "You ran out of time." : "Wrong call."}
                  </p>
                                    <p>
                    The tanks held {result.total} real fish. {explanations[result.kind]}
                  </p>
                </div>
              ) : (
                <div>
                  <p className={`mb-3 font-bold ${lowTime ? "text-reject" : ""}`}>{timeLeft} seconds left</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => decide(true)}
                      disabled={busy}
                      className={`${stampButton} border-approve text-approve hover:bg-approve hover:text-paper`}
                    >
                      Approve (A)
                    </button>
                    <button
                      onClick={() => decide(false)}
                      disabled={busy}
                      className={`${stampButton} border-reject text-reject hover:bg-reject hover:text-paper`}
                    >
                      Reject (R)
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {(!crate || result) && (
          <div className="mt-6">
            {note && <p className="mb-3 border-l-4 border-stencil pl-3 text-lg">{note}</p>}

            {!run && (
              <div className="max-w-xl">
                <p className="mb-4 text-lg">
                  Each crate comes with paperwork that says how many fish are inside. Count the fish in
                  every tank and add them up. Approve the paperwork if it matches, reject it if it
                  doesn&apos;t. Three mistakes and you&apos;re fired.
                </p>
                <button onClick={() => sendAction("start")} disabled={busy} className={mainButton}>
                  Start my first shift
                </button>
              </div>
            )}

            {run?.status === "playing" && (
              <button onClick={loadCrate} disabled={busy} className={mainButton}>
                {result ? "Next crate" : "Continue"}
              </button>
            )}

            {run?.status === "choose" && (
              <div className="flex flex-wrap gap-3">
                <button onClick={() => sendAction("replay")} disabled={busy} className={mainButton}>
                  Replay this level
                </button>
                <button onClick={() => sendAction("restart")} disabled={busy} className={quietButton}>
                  Start over
                </button>
              </div>
            )}

            {(run?.status === "fired" || run?.status === "won") && (
              <button onClick={() => sendAction("start")} disabled={busy} className={mainButton}>
                Play again
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}