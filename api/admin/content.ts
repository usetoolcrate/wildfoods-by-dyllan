import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthedRequest } from "../_lib/auth.js";
import { getSql } from "../_lib/db.js";
import { type InquiryRow, type PlateRow, type ReviewRow, ensureContent, getSetting, setSetting } from "../_lib/content.js";
import { clean } from "../_lib/tickets.js";

/* Admin for site content (behind the existing admin login). One function for
   all of it to stay under Vercel Hobby's limit — new admin actions belong here.
   GET  ?area=plates | reviews | inquiries | summary
   POST savePlate | deletePlate | movePlate | saveReview | deleteReview | moveReview
        | setInquiryStatus | saveSetting */

const INQUIRY_STATUSES = new Set(["new", "replied", "booked", "closed"]);
const SETTINGS = new Set(["google_reviews_url"]);

type Movable = "plates" | "reviews";

// Swap an item with its neighbour, then renumber so positions stay 0..n-1.
async function move(table: Movable, id: number, dir: number) {
  const sql = getSql();
  const rows = (table === "plates"
    ? await sql`SELECT id FROM plates ORDER BY position, id`
    : await sql`SELECT id FROM reviews ORDER BY position, id`) as { id: number }[];
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) {
    if (table === "plates") await sql`UPDATE plates SET position = ${k} WHERE id = ${ids[k]}`;
    else await sql`UPDATE reviews SET position = ${k} WHERE id = ${ids[k]}`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!isAuthedRequest(req)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (req.method === "POST" && !String(req.headers["content-type"] ?? "").includes("application/json")) {
    res.status(415).json({ error: "JSON only" });
    return;
  }
  try {
    await ensureContent();
    const sql = getSql();

    if (req.method === "GET") {
      const area = clean(req.query.area, 20);
      if (area === "plates") {
        res.status(200).json({ plates: (await sql`SELECT * FROM plates ORDER BY position, id`) as PlateRow[] });
        return;
      }
      if (area === "reviews") {
        res.status(200).json({
          reviews: (await sql`
            SELECT id, name, text, rating, source, to_char(review_date, 'YYYY-MM-DD') AS review_date, shown, position
            FROM reviews ORDER BY position, id
          `) as ReviewRow[],
          googleUrl: await getSetting("google_reviews_url"),
        });
        return;
      }
      if (area === "inquiries") {
        res.status(200).json({ inquiries: (await sql`SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 500`) as InquiryRow[] });
        return;
      }
      if (area === "summary") {
        const n = (await sql`
          SELECT
            (SELECT COUNT(*)::int FROM inquiries WHERE status = 'new') AS new_inquiries,
            (SELECT COUNT(*)::int FROM plates WHERE published) AS plates,
            (SELECT COUNT(*)::int FROM reviews WHERE shown) AS reviews,
            (SELECT COUNT(*)::int FROM ticket_events WHERE status IN ('on_sale', 'closed') AND event_date >= (now() AT TIME ZONE 'America/Chicago')::date) AS upcoming
        `) as Record<string, number>[];
        res.status(200).json(n[0] ?? {});
        return;
      }
      res.status(400).json({ error: "Unknown area" });
      return;
    }

    const b = req.body ?? {};
    const action = clean(b.action, 30);
    const id = Math.floor(Number(b.id)) || null;

    if (action === "savePlate") {
      const p = b.plate ?? {};
      const name = clean(p.name, 160);
      if (!name) {
        res.status(400).json({ error: "Give the plate a name." });
        return;
      }
      const rows = (Array.isArray(p.rows) ? p.rows : [])
        .map((r: { label?: unknown; text?: unknown }) => ({ label: clean(r?.label, 40), text: clean(r?.text, 800) }))
        .filter((r: { label: string; text: string }) => r.label || r.text)
        .slice(0, 5);
      const image = clean(p.image, 500) || null;
      const alt = clean(p.alt, 300);
      const published = p.published !== false;
      if (id) {
        await sql`
          UPDATE plates SET name = ${name}, image_url = ${image}, image_alt = ${alt}, rows = ${JSON.stringify(rows)}::text::jsonb,
            published = ${published}, updated_at = now()
          WHERE id = ${id}
        `;
      } else {
        await sql`
          INSERT INTO plates (name, image_url, image_alt, rows, published, position)
          VALUES (${name}, ${image}, ${alt}, ${JSON.stringify(rows)}::text::jsonb, ${published},
            (SELECT COALESCE(MAX(position), -1) + 1 FROM plates))
        `;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (action === "deletePlate" && id) {
      await sql`DELETE FROM plates WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    if ((action === "movePlate" || action === "moveReview") && id) {
      await move(action === "movePlate" ? "plates" : "reviews", id, Number(b.dir) < 0 ? -1 : 1);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === "saveReview") {
      const r = b.review ?? {};
      const name = clean(r.name, 80);
      const text = clean(r.text, 2000);
      if (!name || !text) {
        res.status(400).json({ error: "A name and the review text are required." });
        return;
      }
      const stars = Math.floor(Number(r.rating));
      const rating = stars >= 1 && stars <= 5 ? stars : null;
      const source = ["google", "site", "email"].includes(r.source) ? r.source : "google";
      const date = /^\d{4}-\d{2}-\d{2}$/.test(clean(r.date, 10)) ? clean(r.date, 10) : null;
      const shown = r.shown !== false;
      if (id) {
        await sql`
          UPDATE reviews SET name = ${name}, text = ${text}, rating = ${rating}, source = ${source}, review_date = ${date}::date,
            shown = ${shown}, updated_at = now()
          WHERE id = ${id}
        `;
      } else {
        // New reviews go to the top of the list.
        await sql`UPDATE reviews SET position = position + 1`;
        await sql`
          INSERT INTO reviews (name, text, rating, source, review_date, shown, position)
          VALUES (${name}, ${text}, ${rating}, ${source}, ${date}::date, ${shown}, 0)
        `;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (action === "deleteReview" && id) {
      await sql`DELETE FROM reviews WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    if (action === "setInquiryStatus" && id && INQUIRY_STATUSES.has(clean(b.status, 10))) {
      await sql`UPDATE inquiries SET status = ${clean(b.status, 10)}, updated_at = now() WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    if (action === "saveSetting" && SETTINGS.has(clean(b.key, 40))) {
      const value = clean(b.value, 500);
      if (value && !/^https:\/\//.test(value)) {
        res.status(400).json({ error: "Links must start with https://" });
        return;
      }
      await setSetting(clean(b.key, 40), value);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("admin content error", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Something went wrong" });
  }
}
