"use client";

// The rules, in plain words. Written with some help from AI.

export default function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <section aria-label="How to play" className="max-w-2xl rounded-sm bg-paper p-6 text-ink shadow-lg">
      <h2 className="mb-3 font-display text-3xl font-extrabold tracking-wide">How to play</h2>

      <ol className="mb-5 list-decimal space-y-2 pl-6">
        <li>Every crate arrives with paperwork that says how many fish are inside in total.</li>
        <li>
          Count the real fish in every tank and add them up. Treasure chests and paper fish are not real fish, so
          they don&apos;t count.
        </li>
        <li>
          Approve the paperwork if it matches your count. Reject it if it doesn&apos;t. You can also press A to
          approve and R to reject.
        </li>
        <li>Be quick. Every crate has a timer, and running out of time counts as a mistake.</li>
        <li>
          A correct decision earns 100 points plus a bonus for the time left. A mistake costs a life, and when you
          lose all three you are fired.
        </li>
        <li>
          Three crates make a level, and every position has four levels. Finish the last level with enough points
          and you are promoted from Trainee to Inspector to Chief. If you fall short, you can replay the level or
          start over.
        </li>
      </ol>

      <button
        onClick={onBack}
        className="rounded-sm bg-ink px-5 py-2 font-display text-xl tracking-wide text-paper hover:bg-water focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-water"
      >
        Back to menu
      </button>
    </section>
  );
}