// Decorative water for the menu: three layers of waves and a few fish swimming past.
// Everything is drawn as SVG, so no image files are needed. Written with some help from AI.

import type { CSSProperties } from "react";

// one wave shape that repeats twice, so the loop has no visible seam
const wave =
  "M0 60 C100 20 200 20 300 60 S500 100 600 60 C700 20 800 20 900 60 S1100 100 1200 60 V120 H0 Z";

export function Fish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 20" className={className} aria-hidden="true">
      <path d="M38 10 C32 2 18 2 12 10 C18 18 32 18 38 10 Z" fill="currentColor" />
      <path d="M12 10 L2 3 L4 10 L2 17 Z" fill="currentColor" />
      <circle cx="32" cy="8" r="1.4" fill="#0a1f27" />
    </svg>
  );
}

// the odd one out: a paper fish, like the decoys in the game
function PaperFish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 20" className={className} aria-hidden="true">
      <path
        d="M38 10 C32 2 18 2 12 10 C18 18 32 18 38 10 Z M12 10 L2 3 L4 10 L2 17 Z"
        fill="#f7f4e8"
        stroke="#8a7a52"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path d="M22 4 L24 10 L22 16" fill="none" stroke="#8a7a52" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
      <circle cx="32" cy="8" r="1.4" fill="#3a3a3a" />
    </svg>
  );
}

// each fish swims across at its own speed and depth
function Swimmer({
  depth,
  seconds,
  head,
  children,
}: {
  depth: string;
  seconds: number;
  head: number; // starts this many seconds into its swim, so the screen is never empty
  children: React.ReactNode;
}) {
  const style: CSSProperties = { animationDuration: `${seconds}s`, animationDelay: `-${head}s` };
  return (
    <div className={`fish-swim absolute left-0 ${depth}`} style={style}>
      <div className="fish-bob" style={{ animationDelay: `-${head % 4}s` }}>
        {children}
      </div>
    </div>
  );
}

export default function Water() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 h-56 overflow-hidden">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="wave-back absolute bottom-0 left-0 h-44 w-[200%] text-water/60"
      >
        <path d={wave} fill="currentColor" />
      </svg>

      <Swimmer depth="bottom-40" seconds={62} head={40}>
        <Fish className="h-9 w-[4.5rem] text-foam/30" />
      </Swimmer>
      <Swimmer depth="bottom-32" seconds={48} head={10}>
        <Fish className="h-7 w-14 text-foam/45" />
      </Swimmer>
      <Swimmer depth="bottom-24" seconds={34} head={24}>
        <Fish className="h-5 w-10 text-stencil/60" />
      </Swimmer>
      <Swimmer depth="bottom-36" seconds={70} head={55}>
        <PaperFish className="h-7 w-14 opacity-80" />
      </Swimmer>

      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="wave-mid absolute bottom-0 left-0 h-32 w-[200%] text-water"
      >
        <path d={wave} fill="currentColor" />
      </svg>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="wave-front absolute bottom-0 left-0 h-20 w-[200%] text-deep"
      >
        <path d={wave} fill="currentColor" />
      </svg>
    </div>
  );
}