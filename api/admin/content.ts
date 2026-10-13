import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthedRequest } from "../_lib/auth.js";
import { getSql } from "../_lib/db.js";
import { type InquiryRow, type PlateRow, type ReviewRow, ensureContent, getSetting, setSetting } from "../_lib/content.js";
import { GoogleError, authUrl, disconnect, finishConnect, googleConfigured, googleStatus, listLocations, syncReviews } from "../_lib/google.js";
import { clean, originFrom } from "../_lib/tickets.js";
import { excerpt, normalizeKeep, sentences } from "../../src/lib/sentences.js";

/* Admin for site content (behind the existing admin login). One function for
   all of it to stay under Vercel Hobby's limit — new admin actions belong here.
   GET  ?area=plates | reviews | inquiries | summary | google-locations
        ?area=cron (Vercel cron, CRON_SECRET instead of the admin login): daily Google reviews sync
        ?code=…&state=… is Google's sign-in redirect back to this URL
   POST savePlate | deletePlate | movePlate | saveReview | deleteReview | moveReview
        | setReviewShown | keepSentences | setInquiryStatus | saveSetting
        | googleConnect | googleSetLocation | googleSync | googleDisconnect */

const INQUIRY_STATUSES = new Set(["new", "replied", "booked", "closed"]);
const SETTINGS = new Set(["google_reviews_url"]);

type Movable = "plates" | "reviews";

// Swap an item with its neighbour, then renumber so positions stay 0..n-1. A review
// swaps with the next one in its own group (showing or hidden), since that's the
// order the site and the admin's filtered list show.
async function move(table: Movable, id: number, dir: number) {
  const sql = getSql();
  const rows = (table === "plates"
    ? await sql`SELECT id, true AS shown FROM plates ORDER BY position, id`
    : await sql`SELECT id, shown FROM reviews ORDER BY position, id`) as { id: number; shown: boolean }[];
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(id);
  if (i < 0) return;
  let j = i + dir;
  while (j >= 0 && j < ids.length && rows[j].shown !== rows[i].shown) j += dir;
  if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) {
    if (table === "plates") await sql`UPDATE plates SET position = ${k} WHERE id = ${ids[k]}`;
    else await sql`UPDATE reviews SET position = ${k} WHERE id = ${ids[k]}`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  // Daily Google reviews sync. Vercel sends CRON_SECRET as a bearer token.
  if (req.method === "GET" && req.query.area === "cron") {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    await ensureContent();
    const ready = googleConfigured() && (await getSetting("google_token")) && (await getSetting("google_location"));
    res.status(200).json(ready ? await syncReviews() : { skipped: "Google not connected" });
    return;
  }

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
      // Google's sign-in sends the browser back here with ?code&state (or ?error).
      if (req.query.state && (req.query.code || req.query.error)) {
        let to = "/admin/reviews?google=connected";
        try {
          if (req.query.error) throw new GoogleError(req.query.error === "access_denied" ? "Google sign-in was cancelled." : `Google sign-in failed (${clean(req.query.error, 60)}).`);
          await finishConnect(clean(req.query.code, 2000), clean(req.query.state, 200), `${originFrom(req)}/api/admin/content`);
          // One profile (or one called Wild Foods): pick it and sync straight away.
          const locs = await listLocations().catch(() => []);
          const pick = locs.length === 1 ? locs[0] : locs.find((l) => /wild foods/i.test(l.title));
          if (pick) {
            await setSetting("google_location", JSON.stringify(pick));
            await syncReviews();
          }
        } catch (err) {
          to = `/admin/reviews?google=error&message=${encodeURIComponent(err instanceof Error ? err.message : "Google sign-in failed.")}`;
        }
        res.status(302).setHeader("Location", to);
        res.end();
        return;
      }

      const area = clean(req.query.area, 20);
      if (area === "plates") {
        res.status(200).json({ plates: (await sql`SELECT * FROM plates ORDER BY position, id`) as PlateRow[] });
        return;
      }
      if (area === "reviews") {
        const rows = (await sql`
          SELECT id, name, text, rating, source, to_char(review_date, 'YYYY-MM-DD') AS review_date, shown, position,
            google_id, original_text, keep, is_new
          FROM reviews ORDER BY position, id
        `) as ReviewRow[];
        res.status(200).json({
          // The full text is split into sentences here, for the "keep these sentences" picker.
          reviews: rows.map(({ google_id, original_text, ...r }) => ({ ...r, fromGoogle: Boolean(google_id), sentences: sentences(original_text ?? r.text) })),
          googleUrl: await getSetting("google_reviews_url"),
          google: await googleStatus(),
        });
        return;
      }
      if (area === "google-locations") {
        try {
          res.status(200).json({ locations: await listLocations() });
        } catch (err) {
          res.status(400).json({ error: err instanceof Error ? err.message : "Couldn't reach Google." });
        }
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
            (SELECT COUNT(*)::int FROM reviews WHERE is_new) AS new_reviews,
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
      if (action === "moveReview") await sql`UPDATE reviews SET is_new = false WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    // Showing a review puts it first, so it's on the home page (which shows the first 4).
    if (action === "setReviewShown" && id) {
      if (b.shown === true) {
        await sql`UPDATE reviews SET shown = true, is_new = false, position = (SELECT COALESCE(MIN(position), 0) - 1 FROM reviews), updated_at = now() WHERE id = ${id}`;
      } else {
        await sql`UPDATE reviews SET shown = false, is_new = false, updated_at = now() WHERE id = ${id}`;
      }
      res.status(200).json({ ok: true });
      return;
    }

    // Shorten a review to some of its sentences. The words always come from the
    // reviewer's full text; only which sentences show can change.
    if (action === "keepSentences" && id) {
      const rows = (await sql`SELECT text, original_text FROM reviews WHERE id = ${id}`) as ReviewRow[];
      if (!rows[0]) {
        res.status(404).json({ error: "Review not found" });
        return;
      }
      const full = rows[0].original_text ?? rows[0].text;
      const all = sentences(full);
      const keep = normalizeKeep(b.keep, all.length);
      await sql`
        UPDATE reviews SET original_text = ${full}, keep = ${keep ? JSON.stringify(keep) : null}::text::jsonb, text = ${excerpt(all, keep)},
          is_new = false, updated_at = now()
        WHERE id = ${id}
      `;
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
        const linked = (await sql`SELECT 1 FROM reviews WHERE id = ${id} AND google_id IS NOT NULL`) as unknown[];
        if (linked.length) {
          res.status(400).json({ error: "Reviews from Google can be shortened, shown or hidden, but not edited." });
          return;
        }
        // A hand-entered review edited here becomes its own new full text.
        await sql`
          UPDATE reviews SET name = ${name}, text = ${text}, original_text = NULL, keep = NULL, rating = ${rating}, source = ${source},
            review_date = ${date}::date, shown = ${shown}, updated_at = now()
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
      // Google ones would just come back on the next sync; hide them instead.
      await sql`DELETE FROM reviews WHERE id = ${id} AND google_id IS NULL`;
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

    if (action === "googleConnect") {
      if (!googleConfigured()) {
        res.status(400).json({ error: "Google sign-in isn't set up on the server yet (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)." });
        return;
      }
      res.status(200).json({ ok: true, url: authUrl(`${originFrom(req)}/api/admin/content`) });
      return;
    }

    if (action === "googleSetLocation") {
      const pick = (await listLocations()).find((l) => l.location === clean(b.location, 80) && l.account === clean(b.account, 80));
      if (!pick) {
        res.status(400).json({ error: "That profile isn't one this Google account manages." });
        return;
      }
      await setSetting("google_location", JSON.stringify(pick));
      res.status(200).json({ ok: true, sync: await syncReviews() });
      return;
    }

    if (action === "googleSync") {
      const sync = await syncReviews();
      res.status(sync.error ? 400 : 200).json({ ok: !sync.error, error: sync.error || undefined, sync });
      return;
    }

    if (action === "googleDisconnect") {
      await disconnect();
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    if (err instanceof GoogleError) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("admin content error", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Something went wrong" });
  }
}
