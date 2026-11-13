"use client";

// The main menu. Written with some help from AI.

import type { RunInfo } from "@/components/types";
import Water, { Fish } from "@/components/Water";

type Props = {
  username: string;
  run: RunInfo | null;
  onPlay: () => void;
  onNew: () => void;
  onBoard: () => void;
  onHelp: () => void;
  onLogout: () => void;
};

export default function Menu({ username, run, onPlay, onNew, onBoard, onHelp, onLogout }: Props) {
  // is there a game the player can carry on with?
  const active = run !== null && (run.status === "playing" || run.status === "choose");

  const big =
    "w-full rounded-sm px-6 py-3 text-left font-display text-2xl tracking-wide transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-paper";
  const main = `${big} flex items-center justify-between bg-stencil text-ink hover:brightness-110`;
  const quiet = `${big} border-2 border-foam/40 bg-water/30 hover:bg-water/60`;

  return (
    <>
      <Water />

      <div className="relative z-10 pb-56">
        <p className="mb-8 max-w-xl font-display text-3xl tracking-wide">
          Count the fish. Check the paperwork. Keep your job.
        </p>

        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <nav aria-label="Main menu" className="flex max-w-md flex-col gap-3">
            <button onClick={active ? onPlay : onNew} className={main}>
              {active ? "Continue your shift" : "Start a new game"}
              <Fish className="h-5 w-10 text-ink/70" />
            </button>
            {active && (
              <button onClick={onNew} className={quiet}>
                Start a new game
              </button>
            )}
            <button onClick={onBoard} className={quiet}>
              Leaderboard
            </button>
            <button onClick={onHelp} className={quiet}>
              How to play
            </button>
            <button onClick={onLogout} className={quiet}>
              Log out
            </button>
          </nav>

          <section aria-label="Your desk" className="relative -rotate-1 rounded-sm bg-paper p-5 text-ink shadow-lg">
            <div
              aria-hidden="true"
              className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2 bg-stencil/60"
            />
            <p className="mb-3 text-ink/70">Welcome back, {username}.</p>

            {run && active && (
              <div>
                <p className="font-display text-4xl font-extrabold leading-none">{run.position}</p>
                <p className="mt-2">
                  Level {run.level} of {run.levelCount}
                </p>
                <p>
                  {run.points} points
                  {run.pointsToPromote > 0 && `, ${run.pointsToPromote} needed to be promoted`}
                </p>
                <p>
                  {run.lives} {run.lives === 1 ? "life" : "lives"} left
                </p>
                {run.status === "choose" && (
                  <p className="mt-2 font-bold">
                    You finished the last level without enough points. Open your shift to choose what to do next.
                  </p>
                )}
              </div>
            )}

            {run && run.status === "fired" && <p>Your last game ended: you were fired.</p>}
            {run && run.status === "won" && <p>Your last game ended: you reached the top.</p>}
            {!run && <p>You have no game in progress. Time to start your first shift.</p>}
          </section>
        </div>
      </div>
    </>
  );
}