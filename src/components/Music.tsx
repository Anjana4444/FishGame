"use client";



import { useEffect, useRef, useState } from "react";
import { setSoundMuted } from "@/lib/audio/sounds";

export default function Music() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio("/audio/harbour.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    function start() {
      audio.play().catch(() => {}); 
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    }
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);

    return () => {
      audio.pause();
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    setSoundMuted(muted);
  }, [muted]);

  return (
    <button
      onClick={() => setMuted(!muted)}
      aria-pressed={muted}
      className="rounded-sm border-2 border-paper/60 px-3 py-1 font-display text-lg tracking-wide hover:bg-paper/10 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-paper"
    >
      {muted ? "Music off" : "Music on"}
    </button>
  );
}