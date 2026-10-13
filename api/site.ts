import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSql } from "./_lib/db.js";
import { type InquiryRow, type PlateRow, type ReviewRow, ensureContent, getSetting, notifyInquiry } from "./_lib/content.js";
import { clean } from "./_lib/tickets.js";

/* Public site content (one function, ?action=…, to stay under Vercel Hobby's
   function limit — new public actions belong here).
   GET  plates | reviews
   POST inquiry */

const EXPERIENCES = new Set(["Harvest Buffet", "Gathered Family Style", "Chef's Table Plated", "Catering", "Not sure yet"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always fresh: Dyllan should see his admin edits on the site right away.
  res.setHeader("Cache-Control", "no-store");
  try {
    await ensureContent();
    const sql = getSql();
    const action = clean(req.query.action ?? req.body?.action, 20);

    if (req.method === "GET" && action === "plates") {
      const plates = (await sql`SELECT * FROM plates WHERE published ORDER BY position, id`) as PlateRow[];
      res.status(200).json({
        plates: plates.map((p) => ({ id: p.id, name: p.name, image: p.image_url, alt: p.image_alt, rows: p.rows.filter((r) => r.label && r.text) })),
      });
      return;
    }

    if (req.method === "GET" && action === "reviews") {
      const reviews = (await sql`SELECT * FROM reviews WHERE shown ORDER BY position, id`) as ReviewRow[];
      res.status(200).json({
        googleUrl: await getSetting("google_reviews_url"),
        reviews: reviews.map((r) => ({ id: r.id, name: r.name, text: r.text, rating: r.rating, source: r.source })),
      });
      return;
    }

    if (req.method === "POST" && action === "inquiry") {
      const b = req.body ?? {};
      // Hidden field real visitors never see; bots that fill it get a quiet success.
      if (clean(b.website)) {
        res.status(200).json({ ok: true });
        return;
      }
      const name = clean(b.name, 120);
      const email = clean(b.email, 200).toLowerCase();
      const guests = Math.floor(Number(b.guests)) || null;
      const experience = EXPERIENCES.has(clean(b.experience, 40)) ? clean(b.experience, 40) : null;
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ error: "Please add your name and a valid email." });
        return;
      }
      if (guests !== null && (guests < 1 || guests > 500)) {
        res.status(400).json({ error: "Guest count looks off — please check it." });
        return;
      }
      // One inquiry per email per minute keeps double-clicks and scripts from flooding Dyllan's inbox.
      const recent = (await sql`SELECT 1 FROM inquiries WHERE email = ${email} AND created_at > now() - interval '1 minute'`) as unknown[];
      if (recent.length) {
        res.status(200).json({ ok: true });
        return;
      }
      const rows = (await sql`
        INSERT INTO inquiries (name, email, phone, event_date, guests, experience, location, details)
        VALUES (${name}, ${email}, ${clean(b.phone, 40) || null}, ${clean(b.date, 60) || null}, ${guests}, ${experience},
          ${clean(b.location, 160) || null}, ${clean(b.details, 3000) || null})
        RETURNING *
      `) as InquiryRow[];
      const inquiry = rows[0];
      try {
        if (await notifyInquiry(inquiry)) await sql`UPDATE inquiries SET notified = true WHERE id = ${inquiry.id}`;
      } catch (err) {
        console.error("inquiry email failed", err);
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("site api error", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
