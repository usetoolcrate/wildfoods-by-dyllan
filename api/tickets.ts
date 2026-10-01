import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureTicketSchema, getSql } from "./_lib/db.js";
import { isTestMode, stripe } from "./_lib/stripe.js";
import {
  type EventRow,
  type GiftRow,
  type Guest,
  type OrderAddOn,
  type OrderRow,
  clean,
  formatDate,
  getEvent,
  listPublicEvents,
  makeRef,
  originFrom,
  reconcileGift,
  reconcileOrder,
  seatsTaken,
} from "./_lib/tickets.js";

/* Public ticket + gift certificate endpoint (one function, ?action=…, to stay
   under Vercel Hobby's function limit).
   GET  events | event&slug | order&session | gift&session
   POST checkout | release | guests | gift */

const CHECKOUT_MINUTES = 30; // Stripe's minimum session lifetime; seats are held this long.
const GIFT_MIN = 1500;
const GIFT_MAX = 15000;

function publicEvent(e: EventRow, taken: number) {
  return {
    slug: e.slug,
    name: e.name,
    date: e.date,
    time: e.time_label,
    location: e.location,
    about: e.about,
    priceCents: e.price_cents,
    maxPerOrder: e.max_per_order,
    addOns: e.add_ons,
    status: e.status,
    seatsLeft: Math.max(0, e.capacity - taken),
    test: e.test,
  };
}

function publicOrder(o: OrderRow, e: EventRow | null) {
  return {
    status: o.status,
    seats: o.seats,
    addOns: o.add_ons,
    subtotal: o.amount_subtotal,
    discount: o.amount_discount,
    total: o.amount_total,
    promoCode: o.promo_code,
    buyerName: o.buyer_name,
    buyerEmail: o.buyer_email,
    guests: o.guests,
    guestsSaved: Boolean(o.guests_at),
    event: e ? { slug: e.slug, name: e.name, date: e.date, time: e.time_label, location: e.location } : null,
  };
}

function publicGift(g: GiftRow) {
  return {
    status: g.status,
    amountCents: g.amount_cents,
    code: g.status === "issued" ? g.code : null,
    recipient: g.recipient_name,
    from: g.from_name,
    message: g.message,
  };
}

async function orderBySession(sessionId: string): Promise<OrderRow | null> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM ticket_orders WHERE session_id = ${sessionId}`) as OrderRow[];
  return rows[0] ?? null;
}

async function eventById(id: number): Promise<EventRow | null> {
  const sql = getSql();
  const rows = (await sql`SELECT slug FROM ticket_events WHERE id = ${id}`) as { slug: string }[];
  return rows[0] ? getEvent(rows[0].slug) : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  const mode = isTestMode() ? "test" : "live";
  try {
    await ensureTicketSchema();
    const sql = getSql();
    const action = clean(req.query.action ?? req.body?.action, 20);

    if (req.method === "GET" && action === "events") {
      const events = await listPublicEvents();
      const out = [];
      for (const e of events) out.push(publicEvent(e, await seatsTaken(e.id)));
      res.status(200).json({ mode, events: out });
      return;
    }

    if (req.method === "GET" && action === "event") {
      const e = await getEvent(clean(req.query.slug, 80));
      if (!e || e.status === "draft") {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.status(200).json({ mode, event: publicEvent(e, await seatsTaken(e.id)) });
      return;
    }

    if (req.method === "POST" && action === "checkout") {
      const body = req.body ?? {};
      const e = await getEvent(clean(body.slug, 80));
      if (!e || e.status !== "on_sale") {
        res.status(409).json({ error: "Tickets for this event aren't on sale." });
        return;
      }
      const seats = Math.floor(Number(body.seats));
      const left = e.capacity - (await seatsTaken(e.id));
      if (!Number.isFinite(seats) || seats < 1 || seats > e.max_per_order) {
        res.status(400).json({ error: `Choose between 1 and ${e.max_per_order} seats.` });
        return;
      }
      if (seats > left) {
        res.status(409).json({ error: left > 0 ? `Only ${left} seat${left === 1 ? "" : "s"} left.` : "This dinner is sold out.", seatsLeft: Math.max(0, left) });
        return;
      }
      const picked = (body.addOns ?? {}) as Record<string, unknown>;
      const addOns: OrderAddOn[] = e.add_ons
        .map((a) => ({ key: a.key, name: a.name, price_cents: a.price_cents, qty: Math.max(0, Math.min(seats, Math.floor(Number(picked[a.key]) || 0))) }))
        .filter((a) => a.qty > 0);

      const ref = makeRef();
      const origin = originFrom(req);
      const when = formatDate(e.date);
      const lineItems = [
        {
          price_data: {
            currency: "usd",
            unit_amount: e.price_cents,
            product_data: { name: `${e.name} — ${when}`, description: [e.time_label, e.location].filter(Boolean).join(" · ") || undefined },
          },
          quantity: seats,
        },
        ...addOns.map((a) => ({
          price_data: { currency: "usd", unit_amount: a.price_cents, product_data: { name: `${a.name} — ${e.name}` } },
          quantity: a.qty,
        })),
      ];
      const session = await stripe(
        "POST",
        "checkout/sessions",
        {
          mode: "payment",
          // Card only (it covers Apple Pay and Google Pay). Bank debits and pay-later options settle days later.
          payment_method_types: ["card"],
          line_items: lineItems,
          allow_promotion_codes: true,
          phone_number_collection: { enabled: true },
          expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60 + 30,
          metadata: { kind: "ticket", event: e.slug, ref },
          payment_intent_data: { description: `${seats} × ${e.name} (${when})`, metadata: { kind: "ticket", event: e.slug, ref } },
          custom_text: { submit: { message: "Next, you'll add each guest's name and any allergies or dietary needs." } },
          success_url: `${origin}/tickets/thanks?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/tickets/${e.slug}?release=${ref}`,
        },
        `checkout-${ref}`,
      );
      await sql`
        INSERT INTO ticket_orders (event_id, ref, session_id, status, seats, add_ons, livemode, expires_at)
        VALUES (${e.id}, ${ref}, ${session.id}, 'open', ${seats}, ${JSON.stringify(addOns)}::text::jsonb, ${Boolean(session.livemode)},
          to_timestamp(${session.expires_at}))
      `;
      res.status(200).json({ url: session.url });
      return;
    }

    // Back from Stripe without paying: let the held seats go right away.
    if (req.method === "POST" && action === "release") {
      const ref = clean(req.body?.ref, 40);
      const rows = (await sql`SELECT * FROM ticket_orders WHERE ref = ${ref} AND status = 'open'`) as OrderRow[];
      const o = rows[0];
      if (o?.session_id) {
        try {
          await stripe("POST", `checkout/sessions/${o.session_id}/expire`);
        } catch {
          // Already completed or expired; reconcile below sorts it out.
        }
        await reconcileOrder(o);
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "GET" && action === "order") {
      const sessionId = clean(req.query.session, 200);
      const found = sessionId.startsWith("cs_") ? await orderBySession(sessionId) : null;
      if (!found) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      const o = await reconcileOrder(found);
      res.status(200).json({ mode, order: publicOrder(o, await eventById(o.event_id)) });
      return;
    }

    if (req.method === "POST" && action === "guests") {
      const body = req.body ?? {};
      const sessionId = clean(body.session, 200);
      const found = sessionId.startsWith("cs_") ? await orderBySession(sessionId) : null;
      const o = found ? await reconcileOrder(found) : null;
      if (!o || o.status !== "paid") {
        res.status(409).json({ error: "This order isn't paid yet." });
        return;
      }
      const raw = Array.isArray(body.guests) ? body.guests : [];
      const guests: Guest[] = raw.slice(0, o.seats).map((g: { name?: unknown; diet?: unknown }) => ({ name: clean(g?.name, 120), diet: clean(g?.diet, 300) }));
      if (!guests.length || guests.some((g) => !g.name)) {
        res.status(400).json({ error: "Add a name for every guest." });
        return;
      }
      await sql`UPDATE ticket_orders SET guests = ${JSON.stringify(guests)}::text::jsonb, guests_at = now(), updated_at = now() WHERE id = ${o.id}`;
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "POST" && action === "gift") {
      const body = req.body ?? {};
      const amount = Math.round(Number(body.amountCents));
      if (!Number.isFinite(amount) || amount < GIFT_MIN || amount > GIFT_MAX || amount % 100 !== 0) {
        res.status(400).json({ error: "Choose a whole-dollar amount from $15 to $150." });
        return;
      }
      const recipient = clean(body.recipient, 80);
      const from = clean(body.from, 80);
      const message = clean(body.message, 240);
      const origin = originFrom(req);
      const ref = makeRef();
      const session = await stripe(
        "POST",
        "checkout/sessions",
        {
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: amount,
                product_data: { name: `Wild Foods by Dyllan gift certificate — $${amount / 100}`, description: recipient ? `For ${recipient}` : undefined },
              },
              quantity: 1,
            },
          ],
          metadata: { kind: "gift", ref },
          payment_intent_data: { description: `Gift certificate $${amount / 100}`, metadata: { kind: "gift", ref } },
          success_url: `${origin}/gift-certificates/thanks?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/gift-certificates`,
        },
        `gift-${ref}`,
      );
      await sql`
        INSERT INTO gift_certificates (kind, session_id, status, amount_cents, recipient_name, from_name, message, livemode)
        VALUES ('gift', ${session.id}, 'open', ${amount}, ${recipient || null}, ${from || null}, ${message || null}, ${Boolean(session.livemode)})
      `;
      res.status(200).json({ url: session.url });
      return;
    }

    if (req.method === "GET" && action === "gift") {
      const sessionId = clean(req.query.session, 200);
      const rows = sessionId.startsWith("cs_") ? ((await sql`SELECT * FROM gift_certificates WHERE session_id = ${sessionId}`) as GiftRow[]) : [];
      if (!rows[0]) {
        res.status(404).json({ error: "Gift certificate not found" });
        return;
      }
      res.status(200).json({ mode, gift: publicGift(await reconcileGift(rows[0])) });
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("tickets api error", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
