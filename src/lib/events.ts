

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

export function on(event: GameEvent, handler: Handler): () => void {
  (handlers[event] ??= []).push(handler);
  return () => {
    handlers[event] = handlers[event]?.filter((h) => h !== handler);
  };
}

export function emit(event: GameEvent) {
  handlers[event]?.forEach((handler) => handler());
}