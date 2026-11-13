

import { on, type GameEvent } from "@/lib/events";

let context: AudioContext | null = null;
let muted = false;

export function setSoundMuted(value: boolean) {
  muted = value;
}


function getContext(): AudioContext | null {
  if (muted) return null;
  if (!context) context = new AudioContext();
  if (context.state === "suspended") context.resume();
  return context;
}

function tone(freq: number, start: number, length: number, type: OscillatorType = "sine", volume = 0.2) {
  const c = getContext();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  const t = c.currentTime + start;

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + length);
}

function thump() {
  const c = getContext();
  if (!c) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  const t = c.currentTime;

  osc.type = "sine";
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
  gain.gain.setValueAtTime(0.6, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.2);
}

function fanfare() {
  [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.15, i === 3 ? 0.5 : 0.15, "triangle", 0.25));
}

const sounds: Record<GameEvent, () => void> = {
  stamp: thump,
  correct: () => {
    tone(660, 0, 0.12);
    tone(880, 0.12, 0.2);
  },
  wrong: () => tone(160, 0, 0.35, "sawtooth", 0.15),
  timeUp: () => {
    tone(220, 0, 0.2, "square", 0.12);
    tone(150, 0.2, 0.4, "square", 0.12);
  },
  lowTime: () => tone(1000, 0, 0.05, "square", 0.06),
  nextLevel: () => {
    tone(523, 0, 0.12);
    tone(659, 0.12, 0.12);
    tone(784, 0.24, 0.25);
  },
  promoted: fanfare,
  won: fanfare,
  choose: () => tone(330, 0, 0.3, "triangle", 0.2),
  fired: () => {
    [392, 349, 311, 262].forEach((freq, i) => tone(freq, i * 0.25, i === 3 ? 0.8 : 0.25, "sawtooth", 0.12));
  },
};

export function setupSounds(): () => void {
  const stops = (Object.keys(sounds) as GameEvent[]).map((event) => on(event, sounds[event]));
  return () => stops.forEach((stop) => stop());
}