import { createHash } from "node:crypto";
import type { EventRow } from "./tickets.js";

// Link previews for ticket pages (api/ticket-page.ts, api/ticket-image.ts).

export const SITE = "https://wildfoodsbydyllan.com";

// "Saturday, January 9, 2027 · 2:00–4:00 PM"
export function ticketWhen(e: EventRow): string {
  const day = new Date(`${e.date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return e.time_label ? `${day} · ${e.time_label}` : day;
}

// Changes whenever something on the share image changes, so apps that cache
// previews by URL fetch the new one.
export function shareVersion(e: EventRow): string {
  const seen = [e.name, e.date, e.time_label, e.location, e.price_cents, e.kind, e.photos[0] ?? ""];
  return createHash("sha1").update(JSON.stringify(seen)).digest("hex").slice(0, 10);
}
