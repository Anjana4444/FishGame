"use client";

// In-game confirmation box, built on the native <dialog> element.
// Written with some help from AI.

import { useEffect, useRef } from "react";
import type { Question } from "@/components/types";

type Props = {
  question: Question | null; // null = nothing to ask
  onYes: () => void;
  onNo: () => void;
};

export default function ConfirmDialog({ question, onYes, onNo }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);

  // open or close the box depending on whether there is a question
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (question && !dialog.open) {
      dialog.showModal();
      noRef.current?.focus(); // start on the safe choice
    }
    if (!question && dialog.open) {
      dialog.close();
    }
  }, [question]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="question-title"
      // Escape key
      onCancel={(e) => {
        e.preventDefault();
        onNo();
      }}
      // a click on the dark area around the box
      onClick={(e) => {
        if (e.target === dialogRef.current) onNo();
      }}
      className="m-auto w-[min(28rem,90vw)] rounded-sm bg-paper p-6 text-ink shadow-lg backdrop:bg-black/60"
    >
      <h2 id="question-title" className="mb-2 font-display text-3xl font-extrabold tracking-wide">
        {question?.title}
      </h2>
      <p className="mb-5">{question?.text}</p>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={onYes}
          className="-rotate-2 rounded-sm border-4 border-reject px-5 py-2 font-display text-2xl tracking-wide text-reject transition-transform hover:bg-reject hover:text-paper active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-water"
        >
          {question?.yes}
        </button>
        <button
          ref={noRef}
          onClick={onNo}
          className="rounded-sm bg-ink px-5 py-2 font-display text-xl tracking-wide text-paper hover:bg-water focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-water"
        >
          Cancel
        </button>
      </div>
    </dialog>
  );
}