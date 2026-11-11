"use client";

// Table of the best players. Written with some help from AI.

import { useEffect, useState } from "react";

type Row = {
  rank: number;
  username: string;
  position: string;
  points: number;
  you: boolean;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  // load the table when the panel opens
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
    <section aria-label="Leaderboard" className="max-w-xl rounded-sm bg-paper p-5 text-ink shadow-lg">
      <h2 className="mb-3 font-display text-3xl font-extrabold tracking-wide">Leaderboard</h2>

      {error && (
        <p role="alert" className="font-bold text-reject">
          {error}
        </p>
      )}
      {!rows && !error && <p>Loading…</p>}
      {rows && rows.length === 0 && <p>Nobody has played yet.</p>}

      {rows && rows.length > 0 && (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-ink/30">
              <th scope="col" className="py-1 pr-3">#</th>
              <th scope="col" className="py-1 pr-3">Inspector</th>
              <th scope="col" className="py-1 pr-3">Best position</th>
              <th scope="col" className="py-1 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.username} className={row.you ? "bg-stencil/30 font-bold" : ""}>
                <td className="py-1 pr-3">{row.rank}</td>
                <td className="py-1 pr-3">{row.username}</td>
                <td className="py-1 pr-3">{row.position}</td>
                <td className="py-1 text-right">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}