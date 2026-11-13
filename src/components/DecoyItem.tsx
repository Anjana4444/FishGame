

export default function DecoyItem({ kind }: { kind: string }) {
  const label = kind === "paper" ? "paper fish" : kind;
  const box = kind === "paper" ? "0 0 64 56" : "0 0 64 48";

  return (
    <svg viewBox={box} className="h-16 w-auto" role="img" aria-label={label}>
      {kind === "paper" && (
        <g transform="rotate(-5 32 28)">
          {/* shadow, the sheet of paper and its bent corner */}
          <rect x="8" y="7" width="50" height="44" fill="rgba(0,0,0,0.35)" />
          <rect x="6" y="5" width="50" height="44" fill="#fbfaf4" stroke="#d6d3c4" strokeWidth="1" />
          <path d="M56 38 L46 49 L56 49 Z" fill="#e5e2d3" />

          {/* a piece of tape holding it up */}
          <rect x="22" y="1" width="14" height="7" fill="rgba(210,166,44,0.6)" />

          {/* the fish, drawn the way a child would draw it */}
          <g strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M13 28 C16 19 30 17 40 25 C42 27 42 29 40 31 C30 39 16 37 13 28 Z"
              fill="#f4a03a"
              stroke="#26466d"
              strokeWidth="1.8"
            />
            <path
              d="M40 25 L53 16 L50 28 L53 40 L40 31"
              fill="#f4a03a"
              stroke="#26466d"
              strokeWidth="1.8"
            />
            <path d="M26 19 L30 14 L33 20" fill="none" stroke="#26466d" strokeWidth="1.8" />
            <circle cx="20" cy="25" r="2.6" fill="#ffffff" stroke="#26466d" strokeWidth="1.2" />
            <circle cx="20.6" cy="25.2" r="1" fill="#26466d" />
            <path d="M14 30 Q17 33 20 31" fill="none" stroke="#26466d" strokeWidth="1.4" />
            <path
              d="M27 23 Q30 28 27 33 M33 22 Q36 28 33 34"
              fill="none"
              stroke="#26466d"
              strokeWidth="1.2"
            />
          </g>
        </g>
      )}

      {kind === "boot" && (
        <g>
          <path
            d="M18 4 H32 V22 C32 26 44 26 52 32 C56 35 56 40 52 40 H16 C14 40 14 38 14 36 Z"
            fill="#6b4a2f"
            stroke="#2b1d12"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M14 36 H54 V40 H14 Z" fill="#2b1d12" />
          <path d="M18 10 H32 M18 15 H32" stroke="#c9a36b" strokeWidth="1.5" />
        </g>
      )}

      {kind === "bottle" && (
        <g>
          <rect x="25" y="2" width="10" height="4" fill="#c9c9c9" />
          <path
            d="M26 6 H34 V14 C34 18 40 20 40 28 V42 C40 44 38 46 36 46 H24 C22 46 20 44 20 42 V28 C20 20 26 18 26 14 Z"
            fill="#3f8f6a"
            stroke="#1f4d38"
            strokeWidth="1.5"
          />
          <rect x="22" y="28" width="16" height="10" fill="#e6ede9" />
        </g>
      )}

      {kind === "can" && (
        <g>
          <path
            d="M18 12 H46 V40 C46 43 40 44 32 44 C24 44 18 43 18 40 Z"
            fill="#9aa5ab"
            stroke="#4b565b"
            strokeWidth="1.5"
          />
          <ellipse cx="32" cy="12" rx="14" ry="4" fill="#c3ccd0" stroke="#4b565b" strokeWidth="1.5" />
          <rect x="18" y="22" width="28" height="10" fill="#c0562f" />
        </g>
      )}
    </svg>
  );
}