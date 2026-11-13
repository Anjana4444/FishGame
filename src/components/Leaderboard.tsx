"use client";



import { useEffect, useState } from "react";

type Row = {
  rank: number;
  username: string;
  position: string;
  points: number;
  you: boolean;
};


const rankStamp = [
  "border-[#9a7412] text-[#9a7412]", 
  "border-[#6b7a80] text-[#6b7a80]", 
  "border-[#8f5a2c] text-[#8f5a2c]", 
];


const positionTag: Record<string, string> = {
  Trainee: "border-water text-water",
  Inspector: "border-approve text-approve",
  Chief: "border-[#9a7412] text-[#9a7412]",
};

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

 
  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.players) setRows(data.players);
        else setError(data.error ?? "Could not load the leaderboard.");
      })
      .catch(() => setError("Could not reach the server."));
  }, []);

  return (
    <section aria-label="Leaderboard" className="planks relative max-w-2xl rounded-sm border-4 border-plank-dark p-4 shadow-lg">
      <div className="relative rounded-sm bg-paper p-6 pt-7 text-ink shadow-md">
        <div
          aria-hidden="true"
          className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-2 bg-stencil/60"
        />

        <h2 className="font-display text-4xl font-extrabold tracking-wide">Leaderboard</h2>
        <p className="mb-5 text-ink/70">Best inspectors first: highest position, then most points.</p>

        {error && (
          <p role="alert" className="font-bold text-reject">
            {error}
          </p>
        )}
        {!rows && !error && <p>Loading…</p>}
        {rows && rows.length === 0 && <p>Nobody is on the board yet. Finish a crate to be the first.</p>}

        {rows && rows.length > 0 && (
          <ol className="border-l-4 border-reject/40 pl-4">
            {rows.map((row) => (
              <li
                key={row.username}
                className={`flex items-center gap-3 border-b border-ink/10 py-2 ${
                  row.you ? "-ml-2 rounded-sm bg-stencil/25 pl-2 pr-2" : ""
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 -rotate-6 items-center justify-center rounded-full border-4 font-display text-2xl font-extrabold ${
                    rankStamp[row.rank - 1] ?? "border-ink/30 text-ink/60"
                  }`}
                >
                  {row.rank}
                </span>

                <div className="min-w-0">
                  <p className="truncate font-display text-2xl font-bold leading-tight">
                    {row.username}
                    {row.you && <span className="ml-2 text-base font-normal text-ink/70">(you)</span>}
                  </p>
                  <span
                    className={`inline-block -rotate-1 rounded-sm border-2 px-2 font-display text-sm tracking-wide ${
                      positionTag[row.position] ?? "border-ink/30 text-ink/60"
                    }`}
                  >
                    {row.position}
                  </span>
                </div>

                {/* dotted line from the name to the points, like a ledger */}
                <span aria-hidden="true" className="h-0 flex-1 self-center border-b-2 border-dotted border-ink/30" />

                <p className="shrink-0 font-display text-3xl font-extrabold">
                  {row.points}
                  <span className="ml-1 font-body text-sm font-normal text-ink/60">points</span>
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}