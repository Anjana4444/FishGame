"use client";

// Background music with a mute button.
// Music: <title> by <artist>, <source URL>, <licence>   <- fill this in
// Browsers block sound until the player has interacted with the page,
// so the music starts on the first click or key press.

import { useEffect, useRef, useState } from "react";
import { setSoundMuted } from "@/lib/audio/sounds";

export default function Music() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  // create the audio once and start it on the first interaction
  useEffect(() => {
    const audio = new Audio("/audio/harbour.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    function start() {
      audio.play().catch(() => {}); // ignore if the browser still refuses
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

  // apply the mute button
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