import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthedRequest } from "../_lib/auth.js";
import { ensureTicketSchema, getSql } from "../_lib/db.js";
import { dashboardUrl, isTestMode, stripe } from "../_lib/stripe.js";
import {
  type AddOn,
  type GiftRow,
  type OrderRow,
  clean,
  issueCode,
  listAllEvents,
  reconcileGift,
  reconcileOrder,
  refreshRefund,
} from "../_lib/tickets.js";

/* Admin side of ticket sales (behind the existing admin login).
   GET                → events with seat counts, every order, gift certificates and credits
   POST saveEvent     → create or update an event
   POST credit        → issue a one-time credit code for an order (the "credit instead of refund" option) */

const STATUSES = new Set(["draft", "on_sale", "closed"]);

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function cents(value: unknown): number {
  return Math.round(Number(value) * 100);
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
    await ensureTicketSchema();
    const sql = getSql();
    const action = clean(req.body?.action, 20);

    if (req.method === "GET") {
      // Settle anything still in flight, and pick up refunds made in Stripe.
      const live = (await sql`SELECT * FROM ticket_orders WHERE status IN ('open', 'processing', 'paid') ORDER BY id DESC LIMIT 300`) as OrderRow[];
      for (const o of live) {
        if (o.status === "paid") await refreshRefund(o);
        else await reconcileOrder(o);
      }
      const openGifts = (await sql`SELECT * FROM gift_certificates WHERE status = 'open' ORDER BY id DESC LIMIT 50`) as GiftRow[];
      for (const g of openGifts) await reconcileGift(g);

      const events = await listAllEvents();
      const orders = (await sql`SELECT * FROM ticket_orders WHERE status <> 'expired' ORDER BY created_at DESC`) as OrderRow[];
      const gifts = (await sql`SELECT * FROM gift_certificates WHERE status = 'issued' ORDER BY created_at DESC`) as GiftRow[];
      const redeemed: Record<number, number> = {};
      for (const g of gifts) {
        if (!g.promotion_code_id) continue;
        try {
          const p = await stripe("GET", `promotion_codes/${g.promotion_code_id}`);
          redeemed[g.id] = Number(p.times_redeemed ?? 0);
        } catch {
          redeemed[g.id] = 0;
        }
      }
      const out = events.map((e) => {
        const mine = orders.filter((o) => o.event_id === e.id);
        const sold = mine.filter((o) => o.status === "paid").reduce((n, o) => n + o.seats, 0);
        const held = mine.filter((o) => o.status === "processing" || (o.status === "open" && o.expires_at && new Date(o.expires_at) > new Date())).reduce((n, o) => n + o.seats, 0);
        const revenue = mine.filter((o) => o.status === "paid").reduce((n, o) => n + Number(o.amount_total ?? 0) - Number(o.amount_refunded ?? 0), 0);
        return { ...e, sold, held, revenue };
      });
      res.status(200).json({
        mode: isTestMode() ? "test" : "live",
        events: out,
        orders: orders
          .filter((o) => o.status !== "open")
          .map((o) => ({ ...o, paymentUrl: o.payment_intent ? dashboardUrl(`payments/${o.payment_intent}`) : null })),
        gifts: gifts.map((g) => ({ ...g, redeemed: redeemed[g.id] ?? 0 })),
      });
      return;
    }

    if (req.method === "POST" && action === "saveEvent") {
      const e = req.body?.event ?? {};
      const id = Number(e.id) || null;
      const name = clean(e.name, 120);
      const date = clean(e.date, 10);
      const price = cents(e.price);
      const capacity = Math.floor(Number(e.capacity));
      const maxPerOrder = Math.floor(Number(e.maxPerOrder)) || 8;
      const status = clean(e.status, 10);
      if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !(price >= 100) || !(capacity >= 1) || !STATUSES.has(status)) {
        res.status(400).json({ error: "Name, date, a price of at least $1, and a capacity are required." });
        return;
      }
      const addOns: AddOn[] = (Array.isArray(e.addOns) ? e.addOns : [])
        .map((a: { name?: unknown; price?: unknown }) => ({ name: clean(a?.name, 80), price_cents: cents(a?.price) }))
        .filter((a: { name: string; price_cents: number }) => a.name && a.price_cents >= 100)
        .slice(0, 6)
        .map((a: { name: string; price_cents: number }) => ({ key: slugify(a.name) || "add-on", ...a }));
      const fields = {
        name,
        date,
        time: clean(e.time, 80),
        location: clean(e.location, 120),
        about: clean(e.about, 1200),
        test: Boolean(e.test),
      };
      if (id) {
        await sql`
          UPDATE ticket_events SET name = ${fields.name}, event_date = ${fields.date}::date, time_label = ${fields.time},
            location = ${fields.location}, about = ${fields.about}, price_cents = ${price}, capacity = ${capacity},
            max_per_order = ${maxPerOrder}, add_ons = ${JSON.stringify(addOns)}::text::jsonb, status = ${status}, test = ${fields.test},
            updated_at = now()
          WHERE id = ${id}
        `;
      } else {
        let slug = slugify(`${name} ${date}`);
        const taken = (await sql`SELECT slug FROM ticket_events WHERE slug LIKE ${`${slug}%`}`) as { slug: string }[];
        if (taken.some((t) => t.slug === slug)) slug = `${slug}-${taken.length + 1}`;
        await sql`
          INSERT INTO ticket_events (slug, name, event_date, time_label, location, about, price_cents, capacity, max_per_order, add_ons, status, test)
          VALUES (${slug}, ${fields.name}, ${fields.date}::date, ${fields.time}, ${fields.location}, ${fields.about}, ${price}, ${capacity},
            ${maxPerOrder}, ${JSON.stringify(addOns)}::text::jsonb, ${status}, ${fields.test})
        `;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "POST" && action === "credit") {
      const orderId = Math.floor(Number(req.body?.orderId));
      const amount = cents(req.body?.amount);
      const note = clean(req.body?.note, 200);
      const rows = (await sql`SELECT * FROM ticket_orders WHERE id = ${orderId}`) as OrderRow[];
      const o = rows[0];
      if (!o || !(amount >= 100)) {
        res.status(400).json({ error: "Pick an order and an amount of at least $1." });
        return;
      }
      const issued = await issueCode({
        seed: `credit-${o.id}-${Date.now()}`,
        amountCents: amount,
        label: `Credit $${amount / 100}`,
        metadata: { order_id: String(o.id), kind: "credit" },
      });
      await sql`
        INSERT INTO gift_certificates (kind, status, amount_cents, code, coupon_id, promotion_code_id, recipient_name, buyer_email, order_id, note, livemode)
        VALUES ('credit', 'issued', ${amount}, ${issued.code}, ${issued.couponId}, ${issued.promotionCodeId}, ${o.buyer_name}, ${o.buyer_email},
          ${o.id}, ${note || null}, ${o.livemode})
      `;
      res.status(200).json({ ok: true, code: issued.code });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("admin tickets error", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Something went wrong" });
  }
}
