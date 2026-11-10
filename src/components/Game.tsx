"use client";

// Main game screen: shows the crate, the timer and the decision buttons.
// Written with some help from AI.

import { useEffect, useState } from "react";

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

type Crate = { id: string; images: string[]; claim: number; seconds: number };

type Result = {
  correct: boolean;
  onTime: boolean;
  wasHonest: boolean;
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

export default function Game() {
  const [run, setRun] = useState<RunInfo | null>(null);
  const [crate, setCrate] = useState<Crate | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // when the page opens, check if a game is already running
  useEffect(() => {
    fetch("/api/run")
      .then((res) => res.json())
      .then((data) => setRun(data.run));
  }, []);

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
        setResult({ ...data, noAnswer: approve === null });
        setRun(data.run);
      }
    } catch {
      setMessage("Could not reach the server.");
    }
    setBusy(false);
  }

  const showCrate = crate && !result;
  const buttonStyle = "rounded px-5 py-2 font-semibold disabled:opacity-50";

  return (
    <main className="min-h-screen bg-slate-900 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold">Harbour Inspector</h1>

        {run && (
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 rounded bg-slate-800 p-3 text-sm">
            <span>Position: {run.position}</span>
            <span>
              Level: {run.level}/{run.levelCount}
            </span>
            <span>
              Crate: {Math.min(run.cratesDone + 1, run.cratesPerLevel)}/{run.cratesPerLevel}
            </span>
            <span>
              Points: {run.points}
              {run.pointsToPromote > 0 && ` / ${run.pointsToPromote}`}
            </span>
            <span>Lives: {run.lives}</span>
          </div>
        )}

        {message && <p className="mb-4 text-red-400">{message}</p>}

        {showCrate && (
          <div className="rounded bg-slate-800 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-lg">
                Paperwork says: <strong>{crate.claim} fish</strong> in total
              </p>
              <p className={timeLeft <= 10 ? "text-2xl font-bold text-red-400" : "text-2xl font-bold"}>
                {timeLeft}s
              </p>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {crate.images.map((image, i) => (
                <div key={i}>
                  <p className="mb-1 text-sm text-slate-400">Tank {i + 1}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`Fish tank ${i + 1}`} className="w-full rounded" />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => decide(true)}
                disabled={busy}
                className={`${buttonStyle} bg-green-600 hover:bg-green-500`}
              >
                Approve
              </button>
              <button
                onClick={() => decide(false)}
                disabled={busy}
                className={`${buttonStyle} bg-red-600 hover:bg-red-500`}
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {!showCrate && (
          <div className="rounded bg-slate-800 p-4">
            {result && (
              <div className="mb-4">
                <p className="text-xl font-bold">
                  {result.correct
                    ? "Correct!"
                    : result.noAnswer
                      ? "Time ran out!"
                      : "Wrong decision."}
                </p>
                <p>
                  The paperwork said {result.claim}, the real total was {result.total}. That crate was{" "}
                  {result.wasHonest ? "honest." : "cheating."}
                </p>
                {eventText[result.event] && <p className="mt-2 text-yellow-300">{eventText[result.event]}</p>}
              </div>
            )}

            {!run && (
              <button
                onClick={() => sendAction("start")}
                disabled={busy}
                className={`${buttonStyle} bg-blue-600 hover:bg-blue-500`}
              >
                Start my first shift
              </button>
            )}

            {run?.status === "playing" && (
              <button
                onClick={loadCrate}
                disabled={busy}
                className={`${buttonStyle} bg-blue-600 hover:bg-blue-500`}
              >
                {result ? "Next crate" : "Continue"}
              </button>
            )}

            {run?.status === "choose" && (
              <div className="flex gap-3">
                <button
                  onClick={() => sendAction("replay")}
                  disabled={busy}
                  className={`${buttonStyle} bg-blue-600 hover:bg-blue-500`}
                >
                  Replay this level
                </button>
                <button
                  onClick={() => sendAction("restart")}
                  disabled={busy}
                  className={`${buttonStyle} bg-slate-600 hover:bg-slate-500`}
                >
                  Start over
                </button>
              </div>
            )}

            {(run?.status === "fired" || run?.status === "won") && (
              <button
                onClick={() => sendAction("start")}
                disabled={busy}
                className={`${buttonStyle} bg-blue-600 hover:bg-blue-500`}
              >
                Play again
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}