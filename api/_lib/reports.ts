import { getSql } from "./db.js";
import { LEGACY_ORDERS } from "./legacy-orders.js";
import { isTestMode, stripe } from "./stripe.js";
import { type GiftRow, type OrderRow, refreshRefund } from "./tickets.js";

/* /admin/reports: every sale Dyllan took online, for his CPA and his Missouri
   sales tax. Two sources:
   - the old WordPress shop (frozen history in legacy-orders.ts), and
   - this site's own Stripe checkouts (ticket orders and gift certificates).
   Stripe fees and the paid date come from the charge's balance transaction and are
   cached on the row the first time they're known. Reading fees needs "Balance: Read"
   on the restricted key; without it the report still loads and shows fees as blank. */

export type ReportRow = {
  id: string;
  paidAt: string;
  site: "Old site" | "This site";
  via: "WooPayments" | "PayPal" | "Stripe";
  order: string;
  customer: string | null;
  items: string;
  kind: "sale" | "gift";
  total: number;
  tax: number;
  fee: number | null;
  discount: number;
  refunded: number;
  net: number | null;
  promo: string | null;
  noTax: boolean;
  note: string | null;
};

// Sales tax was added to checkout on this date (Central). Untaxed sales before it are explained, not mysterious.
const TAX_START = "2026-11-10T06:00:00Z";

type Lookup = { fee: number | null; paidAt: string | null };

async function lookupCharge(sessionId: string, withFee: boolean): Promise<Lookup> {
  const s = await stripe("GET", `checkout/sessions/${sessionId}`, {
    expand: [withFee ? "payment_intent.latest_charge.balance_transaction" : "payment_intent.latest_charge"],
  });
  const charge = s.payment_intent?.latest_charge;
  const bt = charge?.balance_transaction;
  return {
    fee: withFee && bt && typeof bt === "object" ? Number(bt.fee) : null,
    paidAt: charge?.created ? new Date(Number(charge.created) * 1000).toISOString() : null,
  };
}

const DAY = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", year: "numeric" });

function scrub(message: string): string {
  return message.replace(/\b(rk|sk)_(live|test)_[A-Za-z0-9*]+/g, "$1_$2_***");
}

export async function buildReport(): Promise<{ mode: "test" | "live"; rows: ReportRow[]; feesMissing: boolean }> {
  const sql = getSql();
  const live = !isTestMode();
  let feesAllowed = true;
  let feesMissing = false;

  // Fills paid_at / amount_fee the first time they can be read. Never throws: a report that
  // loads without fees beats one that doesn't load.
  async function fill(table: "ticket_orders" | "gift_certificates", id: number, sessionId: string | null, have: { paid_at: string | null; amount_fee: number | null }) {
    if (!sessionId || (have.paid_at && have.amount_fee != null)) return have;
    let got: Lookup = { fee: null, paidAt: null };
    if (feesAllowed) {
      try {
        got = await lookupCharge(sessionId, true);
      } catch (err) {
        feesAllowed = false;
        console.error("report: can't read Stripe fees:", scrub(err instanceof Error ? err.message : String(err)));
      }
    }
    if (!feesAllowed && !have.paid_at) {
      try {
        got = await lookupCharge(sessionId, false);
      } catch (err) {
        console.error("report: can't read Stripe charge:", scrub(err instanceof Error ? err.message : String(err)));
      }
    }
    const paidAt = have.paid_at ?? got.paidAt;
    const fee = have.amount_fee ?? got.fee;
    if (paidAt !== have.paid_at || fee !== have.amount_fee) {
      if (table === "ticket_orders") await sql`UPDATE ticket_orders SET paid_at = ${paidAt}, amount_fee = ${fee} WHERE id = ${id}`;
      else await sql`UPDATE gift_certificates SET paid_at = ${paidAt}, amount_fee = ${fee} WHERE id = ${id}`;
    }
    return { paid_at: paidAt, amount_fee: fee };
  }

  const rows: ReportRow[] = [];

  for (const [order, via, paidAt, items, total, tax, discount, fee, refunded, refundedAt, promo] of LEGACY_ORDERS) {
    const notes: string[] = [];
    if (refunded) notes.push(`${refunded >= total ? "Refunded" : "Partly refunded"}${refundedAt ? ` ${DAY.format(new Date(refundedAt))}` : ""}`);
    if (fee == null) notes.push("PayPal fee not in the backup");
    rows.push({
      id: `wp-${order}`,
      paidAt,
      site: "Old site",
      via,
      order: `#${order}`,
      customer: null,
      items,
      kind: "sale",
      total,
      tax,
      fee,
      discount,
      refunded,
      net: fee == null ? null : total - fee - refunded,
      promo,
      noTax: tax === 0,
      note: notes.join(" · ") || null,
    });
  }

  type OrderWithEvent = OrderRow & { event_name: string; paid_at: string | null; amount_fee: number | null };
  const orders = (await sql`
    SELECT o.*, e.name AS event_name FROM ticket_orders o JOIN ticket_events e ON e.id = o.event_id
    WHERE o.status IN ('paid', 'refunded') AND o.livemode = ${live}
    ORDER BY o.created_at
  `) as OrderWithEvent[];
  for (const o0 of orders) {
    let o = o0;
    try {
      o = { ...o0, ...(await refreshRefund(o0)) };
    } catch (err) {
      console.error("report: can't refresh refund:", scrub(err instanceof Error ? err.message : String(err)));
    }
    const got = await fill("ticket_orders", o.id, o.session_id, o);
    if (got.amount_fee == null) feesMissing = true;
    const total = Number(o.amount_total ?? 0);
    const tax = Number(o.amount_tax ?? 0);
    const refunded = Number(o.amount_refunded ?? 0);
    const addOns = (o.add_ons ?? []).filter((a) => a.qty > 0).map((a) => `${a.name}${a.qty > 1 ? ` ×${a.qty}` : ""}`);
    const paidAt = got.paid_at ?? o.created_at;
    const noTax = total > 0 && tax === 0;
    const notes: string[] = [];
    if (noTax && new Date(paidAt) < new Date(TAX_START)) notes.push("Sold before sales tax was added to checkout (Nov 10, 2026)");
    if (refunded) notes.push(refunded >= total ? "Refunded" : "Partly refunded");
    rows.push({
      id: `t-${o.id}`,
      paidAt: new Date(paidAt).toISOString(),
      site: "This site",
      via: "Stripe",
      order: `Web #${o.id}`,
      customer: o.buyer_name,
      items: [`${o.event_name}${o.seats > 1 ? ` ×${o.seats}` : ""}`, ...addOns].join("; "),
      kind: "sale",
      total,
      tax,
      fee: got.amount_fee,
      discount: Number(o.amount_discount ?? 0),
      refunded,
      net: got.amount_fee == null ? null : total - got.amount_fee - refunded,
      promo: o.promo_code,
      noTax,
      note: notes.join(" · ") || null,
    });
  }

  type GiftWithFee = GiftRow & { paid_at: string | null; amount_fee: number | null };
  const gifts = (await sql`
    SELECT * FROM gift_certificates
    WHERE kind = 'gift' AND status = 'issued' AND session_id IS NOT NULL AND livemode = ${live}
    ORDER BY created_at
  `) as GiftWithFee[];
  for (const g of gifts) {
    const got = await fill("gift_certificates", g.id, g.session_id, g);
    if (got.amount_fee == null) feesMissing = true;
    const paidAt = got.paid_at ?? g.created_at;
    rows.push({
      id: `g-${g.id}`,
      paidAt: new Date(paidAt).toISOString(),
      site: "This site",
      via: "Stripe",
      order: `Gift #${g.id}`,
      customer: g.buyer_name,
      items: `Gift certificate${g.code ? ` ${g.code}` : ""}`,
      kind: "gift",
      total: g.amount_cents,
      tax: 0,
      fee: got.amount_fee,
      discount: 0,
      refunded: 0,
      net: got.amount_fee == null ? null : g.amount_cents - got.amount_fee,
      promo: null,
      noTax: false,
      note: "Gift certificate: no sales tax when sold",
    });
  }

  rows.sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  return { mode: live ? "live" : "test", rows, feesMissing };
}
