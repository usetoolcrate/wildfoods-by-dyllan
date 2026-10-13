// Reviews can be shortened to their best sentences but never reworded: the site
// shows the reviewer's own words, with "…" wherever something was left out.
// Shared by the admin (live preview) and the API (which computes what's saved).

/** A review split into sentences (and paragraphs), in order. */
export function sentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n+/)
    .flatMap((p) => p.match(/[^.!?…]+(?:[.!?…]+["”’')\]]*|$)/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Valid, sorted sentence numbers to keep, or null for the whole review. */
export function normalizeKeep(keep: unknown, count: number): number[] | null {
  if (!Array.isArray(keep)) return null;
  const k = [...new Set(keep.map(Number))].filter((i) => Number.isInteger(i) && i >= 0 && i < count).sort((a, b) => a - b);
  return k.length === 0 || k.length === count ? null : k;
}

/** What the site shows: the kept sentences, with … where some were left out. */
export function excerpt(all: string[], keep: number[] | null): string {
  const k = normalizeKeep(keep, all.length);
  if (!k) return all.join(" ");
  let out = k[0] > 0 ? "… " : "";
  k.forEach((i, n) => {
    if (n > 0) out += k[n - 1] === i - 1 ? " " : " … ";
    out += all[i];
  });
  return k[k.length - 1] < all.length - 1 ? `${out} …` : out;
}
