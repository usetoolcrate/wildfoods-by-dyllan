import crypto from "node:crypto";
import type { VercelRequest } from "@vercel/node";
import { getSql } from "./db.js";
import { stripe, StripeError } from "./stripe.js";

/* Ticket sales without webhooks: every order and gift certificate keeps its
   Stripe Checkout Session id, and we ask Stripe for the session's state when
   it matters (the thank-you page, seat counts, the admin page). At under 10
   events a year that's a handful of calls, and nothing has to be configured
   inside the Stripe account. */

export type AddOn = { key: string; name: string; price_cents: number };
export type OrderAddOn = { key: string; name: string; qty: number; price_cents: number };
export type Guest = { name: string; diet: string };

export type EventRow = {
  id: number;
  slug: string;
  name: string;
  date: string;
  time_label: string;
  location: string;
  about: string;
  price_cents: number;
  capacity: number;
  max_per_order: number;
  add_ons: AddOn[];
  status: "draft" | "on_sale" | "closed";
  test: boolean;
};

export type OrderRow = {
  id: number;
  event_id: number;
  ref: string;
  session_id: string | null;
  status: "open" | "processing" | "paid" | "expired" | "refunded";
  seats: number;
  add_ons: OrderAddOn[];
  amount_subtotal: number | null;
  amount_discount: number | null;
  amount_total: number | null;
  amount_refunded: number;
  promo_code: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  guests: Guest[];
  guests_at: string | null;
  payment_intent: string | null;
  livemode: boolean;
  expires_at: string | null;
  created_at: string;
};

export type GiftRow = {
  id: number;
  kind: "gift" | "credit";
  session_id: string | null;
  status: "open" | "issued" | "expired";
  amount_cents: number;
  code: string | null;
  coupon_id: string | null;
  promotion_code_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  recipient_name: string | null;
  from_name: string | null;
  message: string | null;
  order_id: number | null;
  note: string | null;
  livemode: boolean;
  created_at: string;
};

export async function getEvent(slug: string): Promise<EventRow | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, slug, name, to_char(event_date, 'YYYY-MM-DD') AS date, time_label, location, about,
      price_cents, capacity, max_per_order, add_ons, status, test
    FROM ticket_events WHERE slug = ${slug}
  `) as EventRow[];
  return rows[0] ?? null;
}

// Every event, for the admin page.
export async function listAllEvents(): Promise<EventRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT id, slug, name, to_char(event_date, 'YYYY-MM-DD') AS date, time_label, location, about,
      price_cents, capacity, max_per_order, add_ons, status, test
    FROM ticket_events ORDER BY event_date DESC, id DESC
  `) as EventRow[];
}

// What the public site lists: upcoming, on sale or closed, never test events.
export async function listPublicEvents(): Promise<EventRow[]> {
  const sql = getSql();
  return (await sql`
    SELECT id, slug, name, to_char(event_date, 'YYYY-MM-DD') AS date, time_label, location, about,
      price_cents, capacity, max_per_order, add_ons, status, test
    FROM ticket_events
    WHERE status IN ('on_sale', 'closed') AND NOT test AND event_date >= (now() AT TIME ZONE 'America/Chicago')::date
    ORDER BY event_date ASC, id ASC
  `) as EventRow[];
}

// Seats that are sold, being paid for, or held by a checkout that hasn't expired.
export async function seatsTaken(eventId: number): Promise<number> {
  const sql = getSql();
  // A checkout past its expiry might still have been paid in its last seconds: ask Stripe.
  const stale = (await sql`
    SELECT * FROM ticket_orders
    WHERE event_id = ${eventId} AND status = 'open' AND session_id IS NOT NULL AND expires_at <= now()
    ORDER BY id LIMIT 20
  `) as OrderRow[];
  for (const o of stale) await reconcileOrder(o);
  const rows = (await sql`
    SELECT COALESCE(SUM(seats), 0)::int AS taken FROM ticket_orders
    WHERE event_id = ${eventId}
      AND (status IN ('paid', 'processing') OR (status = 'open' AND expires_at > now()))
  `) as { taken: number }[];
  return Number(rows[0]?.taken ?? 0);
}

async function promoCodeFor(session: { total_details?: { breakdown?: { discounts?: { discount?: { promotion_code?: string | null } }[] } } }): Promise<string | null> {
  const id = session.total_details?.breakdown?.discounts?.[0]?.discount?.promotion_code;
  if (!id) return null;
  try {
    const promo = await stripe("GET", `promotion_codes/${id}`);
    return promo.code ?? null;
  } catch {
    return null;
  }
}

// Bring one order in line with its Checkout Session.
export async function reconcileOrder(order: OrderRow): Promise<OrderRow> {
  if (!order.session_id || order.status === "paid" || order.status === "expired" || order.status === "refunded") return order;
  const sql = getSql();
  const s = await stripe("GET", `checkout/sessions/${order.session_id}`, { expand: ["total_details.breakdown"] });
  const paid = s.status === "complete" && (s.payment_status === "paid" || s.payment_status === "no_payment_required");
  let rows: OrderRow[] = [];
  if (paid || s.status === "complete") {
    const promo = await promoCodeFor(s);
    const c = s.customer_details ?? {};
    rows = (await sql`
      UPDATE ticket_orders SET
        status = ${paid ? "paid" : "processing"},
        amount_subtotal = ${s.amount_subtotal ?? null},
        amount_discount = ${s.total_details?.amount_discount ?? 0},
        amount_total = ${s.amount_total ?? null},
        promo_code = ${promo},
        buyer_name = ${c.name ?? null},
        buyer_email = ${c.email ?? null},
        buyer_phone = ${c.phone ?? null},
        payment_intent = ${typeof s.payment_intent === "string" ? s.payment_intent : (s.payment_intent?.id ?? null)},
        livemode = ${Boolean(s.livemode)},
        updated_at = now()
      WHERE id = ${order.id}
      RETURNING *
    `) as OrderRow[];
  } else if (s.status === "expired") {
    rows = (await sql`UPDATE ticket_orders SET status = 'expired', updated_at = now() WHERE id = ${order.id} RETURNING *`) as OrderRow[];
  }
  return rows[0] ?? order;
}

// Paid orders: pick up refunds made in the Stripe dashboard. A full refund frees the seats.
export async function refreshRefund(order: OrderRow): Promise<OrderRow> {
  if (order.status !== "paid" || !order.payment_intent) return order;
  const pi = await stripe("GET", `payment_intents/${order.payment_intent}`, { expand: ["latest_charge"] });
  const refunded = Number(pi.latest_charge?.amount_refunded ?? 0);
  if (refunded === order.amount_refunded) return order;
  const full = refunded > 0 && refunded >= Number(order.amount_total ?? 0);
  const sql = getSql();
  const rows = (await sql`
    UPDATE ticket_orders SET amount_refunded = ${refunded}, status = ${full ? "refunded" : "paid"}, updated_at = now()
    WHERE id = ${order.id} RETURNING *
  `) as OrderRow[];
  return rows[0] ?? order;
}

/* Gift certificates and credits are Stripe promotion codes on a one-time,
   fixed-amount coupon — so they work at any ticket checkout with no extra code. */

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function codeFrom(seed: string): string {
  const secret = process.env.SESSION_SECRET || "wild-foods";
  const bytes = crypto.createHmac("sha256", secret).update(seed).digest();
  let out = "";
  for (let i = 0; i < 6; i++) out += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  return `WF-${out}`;
}

export async function issueCode(opts: { seed: string; amountCents: number; label: string; metadata: Record<string, string> }) {
  const code = codeFrom(opts.seed);
  const coupon = await stripe(
    "POST",
    "coupons",
    { amount_off: opts.amountCents, currency: "usd", duration: "once", name: opts.label.slice(0, 40), metadata: opts.metadata },
    `${opts.seed}-coupon`,
  );
  let promo;
  try {
    promo = await stripe(
      "POST",
      "promotion_codes",
      { promotion: { type: "coupon", coupon: coupon.id }, code, max_redemptions: 1, metadata: opts.metadata },
      `${opts.seed}-promo`,
    );
  } catch (err) {
    // Older API versions take the coupon directly.
    if (!(err instanceof StripeError) || err.status !== 400) throw err;
    promo = await stripe("POST", "promotion_codes", { coupon: coupon.id, code, max_redemptions: 1, metadata: opts.metadata }, `${opts.seed}-promo-v1`);
  }
  return { code: promo.code as string, couponId: coupon.id as string, promotionCodeId: promo.id as string };
}

export async function reconcileGift(gift: GiftRow): Promise<GiftRow> {
  if (gift.kind !== "gift" || !gift.session_id || gift.status !== "open") return gift;
  const sql = getSql();
  const s = await stripe("GET", `checkout/sessions/${gift.session_id}`);
  if (s.status === "complete" && s.payment_status === "paid") {
    const issued = await issueCode({
      seed: `gift-${gift.session_id}`,
      amountCents: gift.amount_cents,
      label: `Gift certificate $${gift.amount_cents / 100}`,
      metadata: { gift_id: String(gift.id), kind: "gift" },
    });
    const c = s.customer_details ?? {};
    const rows = (await sql`
      UPDATE gift_certificates SET status = 'issued', code = ${issued.code}, coupon_id = ${issued.couponId},
        promotion_code_id = ${issued.promotionCodeId}, buyer_name = ${c.name ?? null}, buyer_email = ${c.email ?? null},
        livemode = ${Boolean(s.livemode)}, updated_at = now()
      WHERE id = ${gift.id} RETURNING *
    `) as GiftRow[];
    return rows[0] ?? gift;
  }
  if (s.status === "expired") {
    const rows = (await sql`UPDATE gift_certificates SET status = 'expired', updated_at = now() WHERE id = ${gift.id} RETURNING *`) as GiftRow[];
    return rows[0] ?? gift;
  }
  return gift;
}

export function makeRef(): string {
  return crypto.randomBytes(12).toString("hex");
}

// Where Stripe sends people back to. Local dev is plain http.
export function originFrom(req: VercelRequest): string {
  const raw = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
  const host = (Array.isArray(raw) ? raw[0] : raw).split(",")[0].trim();
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  return `${local ? "http" : "https"}://${host}`;
}

export function clean(value: unknown, max = 500): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
