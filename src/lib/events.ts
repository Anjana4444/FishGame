// A tiny event system. The game says what happened, and anything that
// cares (sounds now, maybe screen effects later) can listen.
// Written with some help from AI.

export type GameEvent =
  | "stamp"
  | "correct"
  | "wrong"
  | "timeUp"
  | "lowTime"
  | "nextLevel"
  | "promoted"
  | "choose"
  | "fired"
  | "won";

type Handler = () => void;

const handlers: Partial<Record<GameEvent, Handler[]>> = {};

// start listening, returns a function that stops listening again
export function on(event: GameEvent, handler: Handler): () => void {
  (handlers[event] ??= []).push(handler);
  return () => {
    handlers[event] = handlers[event]?.filter((h) => h !== handler);
  };
}

export function emit(event: GameEvent) {
  handlers[event]?.forEach((handler) => handler());
}