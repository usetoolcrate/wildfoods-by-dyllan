import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "@vercel/og";
import { createElement as h } from "react";
import { ensureContent } from "./_lib/content.js";
import { getEvent } from "./_lib/tickets.js";
import { SITE, ticketWhen } from "./_lib/share.js";

/* The 1200×630 picture a shared ticket link shows (see api/ticket-page.ts),
   drawn like the site's other share cards: logo, label, title and contact on
   the left, the event's main photo on the right. The URL carries a version, so
   it's cached for good and a changed event gets a new URL. */

const asset = (name: string) => readFileSync(join(process.cwd(), "api/_lib/og", name));
const fonts = [
  { name: "Cormorant", data: asset("cormorant-500.woff"), weight: 500 as const },
  { name: "Hanken", data: asset("hanken-400.woff"), weight: 400 as const },
  { name: "Hanken", data: asset("hanken-500.woff"), weight: 500 as const },
];
const logo = `data:image/png;base64,${asset("logo.png").toString("base64")}`;

// Events without a photo get one of the site's own.
const FALLBACK = { dinner: "/images/g-dinner-brick.jpg", workshop: "/images/creek-foraging.jpg" };

async function photoData(src: string, origin: string): Promise<string | null> {
  try {
    const r = await fetch(src.startsWith("/") ? `${origin}${src}` : src);
    if (!r.ok) return null;
    const type = r.headers.get("content-type") ?? "image/jpeg";
    if (!/^image\/(jpeg|png)/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureContent();
    const e = await getEvent(String(req.query.slug ?? ""));
    if (!e || !(e.status === "on_sale" || e.status === "closed")) {
      res.redirect(302, `${SITE}/og/farm-to-table.jpg`);
      return;
    }
    const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "");
    const origin = !host || /^(localhost|127\.)/.test(host) ? SITE : `https://${host}`;
    const photo = await photoData(e.photos[0] ?? FALLBACK[e.kind], origin);

    const label = [e.kind === "workshop" ? "Class" : "Dinner", e.location].filter(Boolean).join(" · ");
    const price = e.partner ? `With ${e.partner}` : e.price_cents ? `$${(e.price_cents / 100).toLocaleString("en-US")} per person` : "";
    const size = e.name.length <= 26 ? 66 : e.name.length <= 44 ? 56 : 46;

    const card = h(
      "div",
      { style: { width: 1200, height: 630, display: "flex", background: "#f9f8f3", fontFamily: "Hanken", color: "#18211b" } },
      h(
        "div",
        { style: { width: 720, height: 630, display: "flex", flexDirection: "column", padding: "52px 64px 0 64px" } },
        h("img", { src: logo, width: 200, height: 111, style: { width: 200, height: 111 } }),
        h("div", { style: { marginTop: 44, fontSize: 14, fontWeight: 500, letterSpacing: 2.6, textTransform: "uppercase", color: "#7a4424" } }, label),
        h("div", { style: { marginTop: 18, fontFamily: "Cormorant", fontWeight: 500, fontSize: size, lineHeight: 1.06 } }, e.name),
        h(
          "div",
          { style: { marginTop: 22, display: "flex", flexDirection: "column", fontSize: 21, lineHeight: 1.45, color: "#555c55" } },
          h("div", {}, ticketWhen(e)),
          price ? h("div", {}, price) : null,
        ),
        h(
          "div",
          {
            style: {
              marginTop: "auto",
              marginBottom: 42,
              paddingTop: 20,
              borderTop: "1px solid #e3ded2",
              display: "flex",
              gap: 28,
              fontSize: 15,
              color: "#555c55",
            },
          },
          h("div", {}, "417-403-9265"),
          h("div", {}, "dyllan@wildfoodsbydyllan.com"),
        ),
      ),
      photo
        ? h("img", { src: photo, width: 480, height: 630, style: { width: 480, height: 630, objectFit: "cover" } })
        : h("div", { style: { width: 480, height: 630, background: "#1f3327" } }),
    );

    const image = new ImageResponse(card, { width: 1200, height: 630, fonts });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=31536000, immutable");
    res.status(200).send(Buffer.from(await image.arrayBuffer()));
  } catch (err) {
    console.error(err);
    res.redirect(302, `${SITE}/og/farm-to-table.jpg`);
  }
}
