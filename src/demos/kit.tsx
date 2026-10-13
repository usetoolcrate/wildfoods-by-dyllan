// Building blocks for walkthrough demos: a phone screen with a browser bar, scenes that
// crossfade, a bottom sheet (photo picker, menus), a Paste/Copy bubble and a text caret.
// The site's own styles go inside them; these only supply the device around the site.

import type { CSSProperties, ReactNode } from "react";
import { enter, prog } from "./motion";

/** One screen of the walkthrough, visible over [from, to): fades in with a 16px drift, out the other way. */
export function Scene({ t, from, to, children, style }: { t: number; from: number; to: number; children: ReactNode; style?: CSSProperties }) {
  if (t < from || t >= to) return null;
  const inP = prog(t, from, 0.5);
  const outP = prog(t, to - 0.4, 0.4);
  return (
    <div className="demo-scene" style={{ opacity: Math.min(inP, 1 - outP), transform: `translateX(${((1 - inP) * 16 - outP * 16).toFixed(1)}px)`, ...style }}>
      {children}
    </div>
  );
}

/** Content that scrolls by `y` px (ease it with keyed()). */
export function Scroll({ y, children }: { y: number; children: ReactNode }) {
  return <div style={{ transform: `translateY(${(-y).toFixed(1)}px)` }}>{children}</div>;
}

/** A phone browser: an address bar (or an app title, e.g. "Mail") above the page. */
export function Screen({ url, app, focused, children, background }: { url?: string; app?: string; focused?: boolean; children: ReactNode; background?: string }) {
  return (
    <div className="demo-screen">
      <div className="demo-bar">
        {app ? (
          <div className="demo-app">{app}</div>
        ) : (
          <div className={`demo-url${focused ? " on" : ""}`} data-tap="url">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className={url ? undefined : "ph"}>{url || (focused ? "" : "Search or enter website")}</span>
            {focused ? <Caret /> : null}
          </div>
        )}
      </div>
      <div className="demo-view" style={{ background }}>
        {children}
      </div>
    </div>
  );
}

/** A blinking text caret (drawn by CSS so it blinks without the clock). */
export const Caret = () => <span className="demo-caret" />;

/** A sheet that slides up from the bottom of the screen while p > 0. */
export function Sheet({ p, title, children }: { p: number; title: string; children: ReactNode }) {
  if (p <= 0) return null;
  return (
    <div className="demo-sheet-wrap" style={{ opacity: Math.min(1, p * 1.5) }}>
      <div className="demo-sheet" style={enter(p, 60)}>
        <div className="demo-sheet-grab" />
        <div className="demo-sheet-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

/** The dark Copy / Paste bubble a phone shows on a long press. */
export function Bubble({ p, label, tap, style }: { p: number; label: string; tap: string; style?: CSSProperties }) {
  if (p <= 0) return null;
  return (
    <div className="demo-bubble" data-tap={tap} style={{ ...enter(p, 6), ...style }}>
      {label}
    </div>
  );
}

/** A phone notification banner. */
export function Banner({ p, app, title, text }: { p: number; app: string; title: string; text: string }) {
  if (p <= 0) return null;
  return (
    <div className="demo-banner" style={enter(p, -18)}>
      <div className="demo-banner-app">{app} · now</div>
      <strong>{title}</strong>
      <div>{text}</div>
    </div>
  );
}
