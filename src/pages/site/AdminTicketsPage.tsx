import { useCallback, useEffect, useState } from "react";
import { SITE_STYLES } from "@/pages/site-shared";
import { LoginForm, buttonStyle, labelStyle, secondaryButtonStyle, wrapStyle } from "@/pages/site/AdminRecipesPage";
import { money } from "@/pages/site/TicketPages";

/* /admin/tickets — Dyllan's own events: create and edit them, see who's coming
   (with allergies), print the guest list, and issue credit codes. Refunds and
   discount codes are done in Stripe; this page picks the refunds up. */

type AddOn = { key: string; name: string; price_cents: number };
type AdminEvent = {
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
  sold: number;
  held: number;
  revenue: number;
};
type AdminOrder = {
  id: number;
  event_id: number;
  status: string;
  seats: number;
  add_ons: { name: string; qty: number }[];
  amount_total: number | null;
  amount_discount: number | null;
  amount_refunded: number;
  promo_code: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  guests: { name: string; diet: string }[];
  guests_at: string | null;
  livemode: boolean;
  created_at: string;
  paymentUrl: string | null;
};
type AdminGift = {
  id: number;
  kind: "gift" | "credit";
  amount_cents: number;
  code: string;
  recipient_name: string | null;
  from_name: string | null;
  buyer_name: string | null;
  order_id: number | null;
  note: string | null;
  redeemed: number;
  livemode: boolean;
  created_at: string;
};
type Draft = {
  id?: number;
  name: string;
  date: string;
  time: string;
  location: string;
  about: string;
  price: string;
  capacity: string;
  maxPerOrder: string;
  status: "draft" | "on_sale" | "closed";
  test: boolean;
  addOns: { name: string; price: string }[];
};

const EMPTY: Draft = {
  name: "",
  date: "",
  time: "",
  location: "",
  about: "",
  price: "",
  capacity: "",
  maxPerOrder: "8",
  status: "draft",
  test: false,
  addOns: [],
};

const STATUS_LABEL = { draft: "Draft (hidden)", on_sale: "On sale", closed: "Closed" };
const field: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid var(--line)", fontFamily: "Georgia, serif", fontSize: 15, marginBottom: 14, background: "#fff" };
const cell: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid var(--line)", textAlign: "left", verticalAlign: "top", fontSize: 14 };
const badge = (bg: string): React.CSSProperties => ({ display: "inline-block", fontFamily: "'Courier New', monospace", fontSize: 11, padding: "2px 7px", background: bg, color: "#fff", marginLeft: 8, verticalAlign: "middle" });

const shortDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

function toDraft(e: AdminEvent): Draft {
  return {
    id: e.id,
    name: e.name,
    date: e.date,
    time: e.time_label,
    location: e.location,
    about: e.about,
    price: String(e.price_cents / 100),
    capacity: String(e.capacity),
    maxPerOrder: String(e.max_per_order),
    status: e.status,
    test: e.test,
    addOns: e.add_ons.map((a) => ({ name: a.name, price: String(a.price_cents / 100) })),
  };
}

function EventForm({ initial, onDone }: { initial: Draft; onDone: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setD({ ...d, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveEvent", event: d }),
    });
    setBusy(false);
    if (!res.ok) return setError((await res.json()).error || "Couldn't save.");
    onDone();
  }

  return (
    <form onSubmit={save} style={{ border: "1px solid var(--line)", background: "#fff", padding: 24, margin: "20px 0 36px" }}>
      <h2 style={{ fontSize: 22, marginTop: 0 }}>{d.id ? "Edit event" : "New event"}</h2>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      <label style={labelStyle}>Name</label>
      <input style={field} value={d.name} onChange={set("name")} required />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0 16px" }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input style={field} type="date" value={d.date} onChange={set("date")} required />
        </div>
        <div>
          <label style={labelStyle}>Time</label>
          <input style={field} value={d.time} onChange={set("time")} placeholder="6–9pm" />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={field} value={d.location} onChange={set("location")} placeholder="Seymour, MO" />
        </div>
        <div>
          <label style={labelStyle}>Price per guest ($)</label>
          <input style={field} inputMode="decimal" value={d.price} onChange={set("price")} required />
        </div>
        <div>
          <label style={labelStyle}>Seats</label>
          <input style={field} inputMode="numeric" value={d.capacity} onChange={set("capacity")} required />
        </div>
        <div>
          <label style={labelStyle}>Max per order</label>
          <input style={field} inputMode="numeric" value={d.maxPerOrder} onChange={set("maxPerOrder")} />
        </div>
      </div>
      <label style={labelStyle}>About this dinner</label>
      <textarea style={{ ...field, minHeight: 90 }} value={d.about} onChange={set("about")} />
      <label style={labelStyle}>Add-ons (optional — e.g. a wine pairing)</label>
      {d.addOns.map((a, i) => (
        <div key={`addon-${i}`} style={{ display: "flex", gap: 10 }}>
          <input
            style={{ ...field, flex: 3 }}
            placeholder="Wine pairing"
            value={a.name}
            onChange={(e) => setD({ ...d, addOns: d.addOns.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
          />
          <input
            style={{ ...field, flex: 1 }}
            placeholder="$"
            inputMode="decimal"
            value={a.price}
            onChange={(e) => setD({ ...d, addOns: d.addOns.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })}
          />
          <button type="button" style={{ ...secondaryButtonStyle, marginBottom: 14 }} onClick={() => setD({ ...d, addOns: d.addOns.filter((_, j) => j !== i) })}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" style={{ ...secondaryButtonStyle, marginBottom: 18 }} onClick={() => setD({ ...d, addOns: [...d.addOns, { name: "", price: "" }] })}>
        + Add-on
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginBottom: 18 }}>
        <label>
          <span style={labelStyle}>Status</span>
          <select style={{ ...field, marginBottom: 0 }} value={d.status} onChange={set("status")}>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 14 }}>
          <input type="checkbox" checked={d.test} onChange={(e) => setD({ ...d, test: e.target.checked })} /> Test event — hidden from the public
          lists, reachable by its link
        </label>
      </div>
      <button type="submit" style={buttonStyle} disabled={busy}>
        {busy ? "Saving…" : "Save event"}
      </button>{" "}
      <button type="button" style={secondaryButtonStyle} onClick={onDone}>
        Cancel
      </button>
    </form>
  );
}

function GuestList({ event, orders, onCredit }: { event: AdminEvent; orders: AdminOrder[]; onCredit: (o: AdminOrder) => void }) {
  const paid = orders.filter((o) => o.status === "paid" || o.status === "processing");
  const refunded = orders.filter((o) => o.status === "refunded");
  const addOnTotals: Record<string, number> = {};
  for (const o of paid) for (const a of o.add_ons) addOnTotals[a.name] = (addOnTotals[a.name] ?? 0) + a.qty;
  const missing = paid.filter((o) => !o.guests_at).length;
  return (
    <section style={{ margin: "8px 0 40px" }}>
      <h2 style={{ fontSize: 24, marginBottom: 4 }}>
        {event.name} — guest list
      </h2>
      <p style={{ color: "var(--ink-soft)", marginTop: 0 }}>
        {shortDate(event.date)} · {event.sold} of {event.capacity} seats sold
        {Object.entries(addOnTotals).map(([k, n]) => ` · ${k} × ${n}`)}
        {missing ? ` · ${missing} order${missing === 1 ? " still needs" : "s still need"} guest details` : ""}
      </p>
      <button type="button" className="no-print" style={{ ...secondaryButtonStyle, marginBottom: 16 }} onClick={() => window.print()}>
        Print guest list
      </button>
      {paid.length === 0 ? <p>No tickets sold yet.</p> : null}
      {paid.map((o) => (
        <article key={o.id} style={{ border: "1px solid var(--line)", background: "#fff", padding: "16px 18px", marginBottom: 14, breakInside: "avoid" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
            <strong>
              {o.buyer_name || "—"} · {o.seats} seat{o.seats === 1 ? "" : "s"}
              {o.status === "processing" ? <span style={badge("#8a6d1d")}>payment processing</span> : null}
              {!o.livemode ? <span style={badge("#7a7a7a")}>test</span> : null}
            </strong>
            <span style={{ fontSize: 14 }}>
              {money(o.amount_total ?? 0)} paid
              {o.amount_discount ? ` (−${money(o.amount_discount)}${o.promo_code ? ` ${o.promo_code}` : ""})` : ""}
              {o.amount_refunded ? ` · ${money(o.amount_refunded)} refunded` : ""}
            </span>
          </div>
          <div style={{ fontSize: 14, color: "var(--ink-soft)", margin: "4px 0 10px" }}>
            {[o.buyer_email, o.buyer_phone].filter(Boolean).join(" · ")}
            {o.add_ons.length ? ` · ${o.add_ons.map((a) => `${a.name} × ${a.qty}`).join(", ")}` : ""}
          </div>
          {o.guests_at ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {o.guests.map((g, i) => (
                  <tr key={`${o.id}-${i}`}>
                    <td style={{ ...cell, width: "40%" }}>{g.name}</td>
                    <td style={{ ...cell, color: g.diet ? "var(--rust-deep)" : "var(--ink-soft)" }}>{g.diet || "No dietary notes"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: 14, color: "var(--rust-deep)", margin: 0 }}>Guest names and allergies not added yet.</p>
          )}
          <div className="no-print" style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {o.paymentUrl ? (
              <a href={o.paymentUrl} target="_blank" rel="noopener" style={{ ...secondaryButtonStyle, textDecoration: "none" }}>
                Refund in Stripe
              </a>
            ) : null}
            <button type="button" style={secondaryButtonStyle} onClick={() => onCredit(o)}>
              Issue credit code
            </button>
          </div>
        </article>
      ))}
      {refunded.length ? (
        <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
          Refunded: {refunded.map((o) => `${o.buyer_name} (${o.seats})`).join(", ")}
        </p>
      ) : null}
    </section>
  );
}

export function AdminTicketsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<{ mode: string; events: AdminEvent[]; orders: AdminOrder[]; gifts: AdminGift[] } | null>(null);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Tickets — Wild Foods by Dyllan";
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authed)))
      .catch(() => setAuthed(false));
  }, []);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/tickets");
    if (res.status === 401) return setAuthed(false);
    if (!res.ok) return setError("Couldn't load tickets. Refresh to try again.");
    setData(await res.json());
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  async function credit(o: AdminOrder) {
    const amount = window.prompt(`Credit code for ${o.buyer_name} — amount in dollars:`, String((o.amount_total ?? 0) / 100));
    if (!amount) return;
    const res = await fetch("/api/admin/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "credit", orderId: o.id, amount }),
    });
    const d = await res.json();
    if (!res.ok) return setError(d.error || "Couldn't issue the credit.");
    setNotice(`Credit code for ${o.buyer_name}: ${d.code} — send it to them; it works once at any ticket checkout.`);
    load();
  }

  const wrap = (children: React.ReactNode) => (
    <>
      <style dangerouslySetInnerHTML={{ __html: `${SITE_STYLES} @media print{.no-print{display:none !important;}}` }} />
      {children}
    </>
  );

  if (authed === null) return wrap(<div style={wrapStyle}>Loading…</div>);
  if (!authed) return wrap(<LoginForm title="Tickets" onLoggedIn={() => setAuthed(true)} />);

  const viewed = data?.events.find((e) => e.id === viewing);

  return wrap(
    <div style={{ ...wrapStyle, maxWidth: 1000 }}>
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>
          Tickets
          {data?.mode === "test" ? <span style={badge("#8a6d1d")}>Stripe test mode</span> : null}
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button type="button" style={secondaryButtonStyle} onClick={load}>
            Refresh
          </button>
          <button type="button" style={buttonStyle} onClick={() => setEditing({ ...EMPTY })}>
            New event
          </button>
        </div>
      </div>
      {notice ? <p style={{ background: "#fff", border: "1px solid var(--line)", padding: "10px 14px" }}>{notice}</p> : null}
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      {editing ? (
        <EventForm
          initial={editing}
          onDone={() => {
            setEditing(null);
            load();
          }}
        />
      ) : null}
      {viewed && data ? (
        <GuestList event={viewed} orders={data.orders.filter((o) => o.event_id === viewed.id)} onCredit={credit} />
      ) : null}

      <div className="no-print">
        <h2 style={{ fontSize: 22, marginTop: 28 }}>Your events</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: -8 }}>
          Partner dinners aren't here — the partner sells those tickets. Discount codes and refunds are made in Stripe.
        </p>
        {!data ? (
          <p>Loading…</p>
        ) : data.events.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", minWidth: 560 }}>
            <thead>
              <tr>
                {["Date", "Event", "Status", "Sold", "Revenue", ""].map((h) => (
                  <th key={h} style={{ ...cell, ...labelStyle, display: "table-cell" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.events.map((e) => (
                <tr key={e.id}>
                  <td style={cell}>{shortDate(e.date)}</td>
                  <td style={cell}>
                    <a href={`/tickets/${e.slug}`} target="_blank" rel="noopener">
                      {e.name}
                    </a>
                    {e.test ? <span style={badge("#7a7a7a")}>test</span> : null}
                  </td>
                  <td style={cell}>{STATUS_LABEL[e.status]}</td>
                  <td style={cell}>
                    {e.sold} / {e.capacity}
                    {e.held ? <span style={{ color: "var(--ink-soft)" }}> (+{e.held} in checkout)</span> : null}
                  </td>
                  <td style={cell}>{money(e.revenue)}</td>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>
                    <button type="button" style={secondaryButtonStyle} onClick={() => setViewing(e.id)}>
                      Guest list
                    </button>{" "}
                    <button type="button" style={secondaryButtonStyle} onClick={() => setEditing(toDraft(e))}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        <h2 style={{ fontSize: 22, marginTop: 40 }}>Gift certificates &amp; credits</h2>
        {!data || data.gifts.length === 0 ? (
          <p style={{ color: "var(--ink-soft)" }}>None issued yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", minWidth: 560 }}>
            <thead>
              <tr>
                {["Issued", "Kind", "Amount", "Code", "For", "Used"].map((h) => (
                  <th key={h} style={{ ...cell, ...labelStyle, display: "table-cell" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.gifts.map((g) => (
                <tr key={g.id}>
                  <td style={cell}>{new Date(g.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td style={cell}>
                    {g.kind === "gift" ? "Gift certificate" : "Credit"}
                    {!g.livemode ? <span style={badge("#7a7a7a")}>test</span> : null}
                  </td>
                  <td style={cell}>{money(g.amount_cents)}</td>
                  <td style={{ ...cell, fontFamily: "'Courier New', monospace" }}>{g.code}</td>
                  <td style={cell}>
                    {g.kind === "gift"
                      ? [g.recipient_name && `to ${g.recipient_name}`, (g.from_name || g.buyer_name) && `from ${g.from_name || g.buyer_name}`].filter(Boolean).join(", ")
                      : g.recipient_name}
                    {g.note ? ` — ${g.note}` : ""}
                  </td>
                  <td style={cell}>{g.redeemed ? "Used" : "Not yet"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>,
  );
}
