// Timeline helpers for walkthrough demos. Every demo is a pure function of t (seconds),
// so it can play, pause, loop and jump to a chapter.

import type { CSSProperties } from "react";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Things entering: approximates cubic-bezier(0.22, 1, 0.36, 1). */
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** 0 → 1 over [start, start + dur], eased. */
export const prog = (t: number, start: number, dur = 0.5, ease = easeOut) => ease(clamp01((t - start) / dur));

/** Fade in with a small upward drift. Text moves as a block, never letter by letter. */
export const enter = (p: number, dy = 14): CSSProperties => ({ opacity: p, transform: `translateY(${((1 - p) * dy).toFixed(2)}px)` });

/** Visible between a and b, with short fades at both ends. */
export const win = (t: number, a: number, b: number, fade = 0.3) => Math.min(prog(t, a, fade), 1 - prog(t, b - fade, fade));

/** Typing: how much of `text` shows at t, at ~14 characters a second. */
export const typed = (text: string, t: number, start: number, cps = 14) => text.slice(0, Math.max(0, Math.floor((t - start) * cps)));

/** When typing `text` from `start` finishes. */
export const typedEnd = (text: string, start: number, cps = 14) => start + text.length / cps;

/** A number that eases between keyframes [time, value] over `dur` (scroll positions, counters). */
export function keyed(t: number, frames: [number, number][], dur = 0.8): number {
  let v = frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [at, to] = frames[i];
    if (t < at) break;
    v = lerp(v, to, prog(t, at, dur, easeInOut));
  }
  return v;
}

/** The current state at t: the last [time, state] whose time has passed. */
export function at<T>(t: number, states: [number, T][]): T {
  let s = states[0][1];
  for (const [time, v] of states) if (t >= time) s = v;
  return s;
}
