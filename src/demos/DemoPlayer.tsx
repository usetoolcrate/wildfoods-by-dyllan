// A walkthrough "video" made of the site's own screens: a fixed-size stage (a phone by
// default) scaled to fit its column and driven by one clock t (seconds). The chapters sit
// beside it, show their progress and jump there when tapped. It autoplays while on screen,
// loops, and pauses. With reduced motion it doesn't autoplay, and chapters jump straight
// to their finished frame.
//
// Taps: [time, name] makes the finger tap the element marked data-tap="name" in that
// frame. Positions are measured from the DOM every frame, so nothing is placed by hand
// and targets that scroll or move are followed.

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { clamp01, easeInOut, lerp, prog } from "./motion";

export interface Chapter {
  at: number;
  label: string;
}
export type Tap = [at: number, target: string];

export interface Demo {
  /** Anchor for links like /admin/how#plates. */
  id: string;
  title: string;
  /** One or two sentences beside the demo. */
  text: string;
  duration: number;
  chapters: Chapter[];
  taps?: Tap[];
  render: (t: number) => ReactNode;
}

export const PHONE = { w: 390, h: 720 };

const MOVE = 0.6; // finger travel time
const EARLY = 0.3; // it arrives this long before it taps
const RIPPLE = 0.45;
const CHAIN = 2.6; // taps closer than this keep the finger on screen between them

function useReducedMotion() {
  const [reduce, setReduce] = useState(() => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    mq?.addEventListener?.("change", on);
    return () => mq?.removeEventListener?.("change", on);
  }, []);
  return reduce;
}

type Pt = { x: number; y: number };

/** Where the finger is, how visible, and how far into a tap ripple, at time t. */
function fingerAt(t: number, taps: Tap[], pos: (name: string) => Pt | undefined) {
  if (!taps.length) return null;
  // The tap the finger is heading to (or tapping): the first whose ripple hasn't ended.
  let i = taps.findIndex(([at]) => t < at + RIPPLE);
  if (i < 0) i = taps.length - 1;
  const [atI, name] = taps[i];
  const chained = i > 0 && atI - taps[i - 1][0] < CHAIN;
  const to = pos(name);
  const prev = chained ? pos(taps[i - 1][1]) : undefined;
  if (!to) return null;
  const from = prev ?? { x: to.x + 46, y: to.y + 80 };
  const p = prog(t, atI - EARLY - MOVE, MOVE, easeInOut);

  // Visible from shortly before the first tap of a chain to shortly after its last.
  let first = i;
  while (first > 0 && taps[first][0] - taps[first - 1][0] < CHAIN) first--;
  let last = i;
  while (last < taps.length - 1 && taps[last + 1][0] - taps[last][0] < CHAIN) last++;
  const show = Math.min(prog(t, taps[first][0] - EARLY - MOVE - 0.2, 0.3), 1 - prog(t, taps[last][0] + 0.7, 0.3));

  const tapping = taps.find(([at]) => t >= at && t < at + RIPPLE);
  return { x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p), show, ripple: tapping ? (t - tapping[0]) / RIPPLE : -1 };
}

/** One frame of a demo at time t: the stage contents plus the finger. */
function Canvas({ demo, t, scale, stage, opacity = 1, hideFinger }: { demo: Demo; t: number; scale: number; stage: { w: number; h: number }; opacity?: number; hideFinger?: boolean }) {
  const canvas = useRef<HTMLDivElement>(null);
  const finger = useRef<HTMLDivElement>(null);
  const seen = useRef<Record<string, Pt>>({});

  // Measure every tap target in this frame, then place the finger.
  useLayoutEffect(() => {
    const c = canvas.current;
    const f = finger.current;
    if (!c || !f) return;
    const cr = c.getBoundingClientRect();
    c.querySelectorAll<HTMLElement>("[data-tap]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      seen.current[el.dataset.tap!] = { x: (r.left + r.width / 2 - cr.left) / scale, y: (r.top + r.height / 2 - cr.top) / scale };
    });
    const s = hideFinger ? null : fingerAt(t, demo.taps ?? [], (n) => seen.current[n]);
    f.style.opacity = s ? String(s.show) : "0";
    if (!s) return;
    f.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px)`;
    const [ripple, dot] = f.children as unknown as HTMLElement[];
    ripple.style.opacity = s.ripple < 0 ? "0" : String(1 - s.ripple);
    ripple.style.transform = `scale(${s.ripple < 0 ? 0.6 : 0.6 + s.ripple * 1.6})`;
    dot.style.transform = `scale(${s.ripple >= 0 && s.ripple < 0.4 ? 0.85 : 1})`;
  });

  return (
    <div ref={canvas} className="demo-canvas" style={{ width: stage.w, height: stage.h, transform: `scale(${scale})`, opacity }} aria-hidden="true">
      {demo.render(t)}
      <div ref={finger} className="demo-finger">
        <span className="ripple" />
        <span className="dot" />
      </div>
    </div>
  );
}

/** Every `every` seconds of a demo side by side, for checking a walkthrough without
 *  watching it (e.g. a page's ?frames=<id>). */
export function DemoFrames({ demo, every = 1.5, scale = 0.45, stage = PHONE, at }: { demo: Demo; every?: number; scale?: number; stage?: { w: number; h: number }; at?: number[] }) {
  const times: number[] = at ?? [];
  if (!at) for (let x = 0.2; x < demo.duration; x += every) times.push(Math.round(x * 100) / 100);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {times.map((x) => (
        <div key={x}>
          <div style={{ position: "relative", width: stage.w * scale, height: stage.h * scale, overflow: "hidden", border: "1px solid #999", background: "#fff" }}>
            <Canvas demo={demo} t={x} scale={scale} stage={stage} />
          </div>
          <div style={{ font: "12px monospace" }}>{x.toFixed(1)}s</div>
        </div>
      ))}
    </div>
  );
}

export function DemoPlayer({ demo, stage = PHONE }: { demo: Demo; stage?: { w: number; h: number } }) {
  const { id, title, text, duration, chapters } = demo;
  const reduce = useReducedMotion();
  const endOf = (i: number) => (i + 1 < chapters.length ? chapters[i + 1].at : duration) - 0.05;
  const [t, setT] = useState(() => (reduce ? endOf(0) : 0));
  const [wantPlay, setWantPlay] = useState(!reduce);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const playing = wantPlay && visible;

  // Fit the stage to its column, and only run while it's on screen.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / stage.w));
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    ro.observe(el);
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [stage.w]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setT((x) => (x + dt >= duration ? 0 : x + dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);

  const current = chapters.reduce((c, ch, i) => (t >= ch.at ? i : c), 0);
  // Fade through the loop point instead of snapping back to the start.
  const fade = Math.min(prog(t, 0, 0.3), 1 - prog(t, duration - 0.35, 0.35));

  return (
    <figure className="demo" id={id} aria-labelledby={`${id}-title`}>
      <figcaption className="demo-head">
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{text}</p>
      </figcaption>
      <div className="demo-stage" ref={box} style={{ height: stage.h * scale }}>
        <Canvas demo={demo} t={t} scale={scale} stage={stage} opacity={reduce ? 1 : fade} hideFinger={reduce} />
      </div>
      <div className="demo-nav">
        <ol className="demo-chapters" aria-label={`${title}: steps`}>
          {chapters.map((c, i) => {
            const end = i + 1 < chapters.length ? chapters[i + 1].at : duration;
            const done = clamp01((t - c.at) / (end - c.at));
            return (
              <li key={c.at}>
                <button type="button" aria-current={i === current ? "step" : undefined} onClick={() => setT(reduce ? endOf(i) : c.at)}>
                  <span className="n">{i + 1}</span>
                  <span className="label">{c.label}</span>
                  <span className="bar" aria-hidden="true">
                    <span style={{ width: `${(done * 100).toFixed(1)}%` }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <button type="button" className="demo-play" onClick={() => setWantPlay(!wantPlay)} aria-label={wantPlay ? `Pause: ${title}` : `Play: ${title}`}>
          {wantPlay ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          )}
          <span>{wantPlay ? "Pause" : "Play"}</span>
        </button>
      </div>
    </figure>
  );
}
