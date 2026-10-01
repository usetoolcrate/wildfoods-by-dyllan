import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { V2Page, Html, renderHeader, renderFooter } from "@/pages/v2";

/* Tickets for Dyllan's own events: /tickets/:slug → Stripe Checkout →
   /tickets/thanks, where buyers add each guest's name and dietary needs. */

type AddOn = { key: string; name: string; price_cents: number };
type TicketEvent = {
  slug: string;
  name: string;
  date: string;
  time: string;
  location: string;
  about: string;
  priceCents: number;
  maxPerOrder: number;
  addOns: AddOn[];
  status: "on_sale" | "closed";
  seatsLeft: number;
  test: boolean;
};
type Guest = { name: string; diet: string };
type Order = {
  status: "open" | "processing" | "paid" | "expired" | "refunded";
  seats: number;
  addOns: { name: string; qty: number; price_cents: number }[];
  subtotal: number | null;
  discount: number | null;
  total: number | null;
  promoCode: string | null;
  buyerName: string | null;
  buyerEmail: string | null;
  guests: Guest[];
  guestsSaved: boolean;
  event: { slug: string; name: string; date: string; time: string; location: string } | null;
};

export const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;

export const longDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function TestBar({ mode }: { mode?: string }) {
  if (mode !== "test") return null;
  return (
    <div className="testbar">
      Test mode — nothing is charged. Pay with card 4242 4242 4242 4242, any future date, any CVC.
    </div>
  );
}

export function NoIndex() {
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
  return null;
}

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label}`}>
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label}`}>
        +
      </button>
    </div>
  );
}

const post = (body: unknown) =>
  fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function TicketPage() {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const released = params.get("release");
  const [mode, setMode] = useState<string>();
  const [event, setEvent] = useState<TicketEvent | null>();
  const [seats, setSeats] = useState(2);
  const [adds, setAdds] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/tickets?action=event&slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return setEvent(null);
    const data = await res.json();
    setMode(data.mode);
    setEvent(data.event);
    setSeats((s) => Math.max(1, Math.min(s, data.event.seatsLeft, data.event.maxPerOrder)));
  }, [slug]);

  useEffect(() => {
    (async () => {
      if (released) await post({ action: "release", ref: released }).catch(() => {});
      load();
    })();
  }, [load, released]);

  const maxSeats = event ? Math.min(event.maxPerOrder, event.seatsLeft) : 1;
  const addOnTotal = event ? event.addOns.reduce((n, a) => n + (adds[a.key] ?? 0) * a.price_cents, 0) : 0;
  const total = event ? seats * event.priceCents + addOnTotal : 0;

  function changeSeats(n: number) {
    setSeats(n);
    setAdds((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, Math.min(v, n)])));
  }

  async function buy() {
    if (!event) return;
    setBusy(true);
    setError("");
    try {
      const res = await post({ action: "checkout", slug: event.slug, seats, addOns: adds });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't start checkout. Please try again.");
        if (typeof data.seatsLeft === "number") load();
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't start checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const closed = event && (event.status !== "on_sale" || event.seatsLeft < 1);

  return (
    <V2Page title={event ? `${event.name} — Tickets — Wild Foods by Dyllan` : "Tickets — Wild Foods by Dyllan"}>
      {event?.test ? <NoIndex /> : null}
      <TestBar mode={mode} />
      <Html html={renderHeader("/farm-to-table")} />
      <section className="sec s-paper">
        <div className="c">
          {event === undefined ? (
            <p>Loading…</p>
          ) : event === null ? (
            <div className="sh">
              <div className="label">Tickets</div>
              <h2>We couldn't find that dinner.</h2>
              <p>
                It may have ended or moved. <Link to="/farm-to-table" className="tlink">See upcoming dinners</Link>
              </p>
            </div>
          ) : (
            <div className="tk">
              <div>
                <div className="label">{event.test ? "Test event" : "Tickets"}</div>
                <h1>{event.name}</h1>
                <div className="tk-meta">
                  <span>{longDate(event.date)}</span>
                  {event.time ? <span>{event.time}</span> : null}
                  {event.location ? <span>{event.location}</span> : null}
                </div>
                <p className="tk-about">{event.about}</p>
              </div>
              <div className="tk-card">
                {released ? <p className="notice">Checkout canceled — your seats were released.</p> : null}
                {error ? <p className="notice err">{error}</p> : null}
                <div className="tk-price">
                  {money(event.priceCents)}
                  <small>per guest</small>
                </div>
                {closed ? (
                  <>
                    <p className="tk-left">{event.seatsLeft < 1 ? "Sold out." : "Ticket sales are closed."}</p>
                    <p className="tk-note">
                      Call or text <a href="tel:14174039265">417-403-9265</a> to ask about openings.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="tk-left">
                      {event.seatsLeft <= 10 ? `${event.seatsLeft} seat${event.seatsLeft === 1 ? "" : "s"} left` : "Seats available"}
                    </p>
                    <div className="tk-row">
                      <div className="what">
                        Seats
                        <small>Up to {maxSeats} per order</small>
                      </div>
                      <Stepper value={seats} min={1} max={maxSeats} onChange={changeSeats} label="seats" />
                    </div>
                    {event.addOns.map((a) => (
                      <div className="tk-row" key={a.key}>
                        <div className="what">
                          {a.name}
                          <small>{money(a.price_cents)} each · optional</small>
                        </div>
                        <Stepper
                          value={adds[a.key] ?? 0}
                          min={0}
                          max={seats}
                          onChange={(n) => setAdds((prev) => ({ ...prev, [a.key]: n }))}
                          label={a.name}
                        />
                      </div>
                    ))}
                    <div className="tk-total">
                      <span>Total</span>
                      <strong>{money(total)}</strong>
                    </div>
                    <button type="button" className="btn full" onClick={buy} disabled={busy}>
                      {busy ? "Opening checkout…" : "Continue to payment"}
                    </button>
                    <p className="tk-note">
                      Discount and gift certificate codes go on the next page. Your seats are held for 30 minutes while you pay. After
                      paying, you'll add each guest's name and any allergies.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <Html html={renderFooter()} />
    </V2Page>
  );
}

export function TicketThanksPage() {
  const [params] = useSearchParams();
  const session = params.get("session_id") ?? "";
  const [mode, setMode] = useState<string>();
  const [order, setOrder] = useState<Order | null>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      const res = await fetch(`/api/tickets?action=order&session=${encodeURIComponent(session)}`);
      if (!res.ok) return setOrder(null);
      const data = await res.json();
      setMode(data.mode);
      const o: Order = data.order;
      setOrder(o);
      if (o.status === "paid") {
        setSaved(o.guestsSaved);
        setGuests(
          Array.from({ length: o.seats }, (_, i) => o.guests[i] ?? { name: i === 0 ? (o.buyerName ?? "") : "", diet: "" }),
        );
      } else if ((o.status === "open" || o.status === "processing") && tries++ < 15) {
        timer = setTimeout(load, 2000);
      }
    };
    load();
    return () => clearTimeout(timer);
  }, [session]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await post({ action: "guests", session, guests });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Couldn't save. Please try again.");
      setSaved(true);
    } catch {
      setError("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const ev = order?.event;

  return (
    <V2Page title="Your tickets — Wild Foods by Dyllan">
      <NoIndex />
      <TestBar mode={mode} />
      <Html html={renderHeader("/farm-to-table")} />
      <section className="sec s-paper">
        <div className="c">
          {order === undefined ? (
            <p>Loading your order…</p>
          ) : order === null ? (
            <div className="sh">
              <div className="label">Tickets</div>
              <h2>We couldn't find that order.</h2>
              <p>
                If you were charged, call or text <a href="tel:14174039265">417-403-9265</a> and Dyllan will sort it out.
              </p>
            </div>
          ) : order.status === "expired" ? (
            <div className="sh">
              <div className="label">Tickets</div>
              <h2>This checkout expired before payment went through.</h2>
              <p>Nothing was charged. {ev ? <Link to={`/tickets/${ev.slug}`} className="tlink">Try again</Link> : null}</p>
            </div>
          ) : order.status !== "paid" ? (
            <div className="sh">
              <div className="label">Tickets</div>
              <h2>Finishing up your payment…</h2>
              <p>This usually takes a few seconds. You can refresh this page.</p>
            </div>
          ) : (
            <div className="tk">
              <div>
                <div className="label">You're going</div>
                <h1>{ev?.name}</h1>
                <div className="tk-meta">
                  {ev ? <span>{longDate(ev.date)}</span> : null}
                  {ev?.time ? <span>{ev.time}</span> : null}
                  {ev?.location ? <span>{ev.location}</span> : null}
                </div>
                <ul className="summary">
                  <li>
                    <span>Seats</span>
                    <span>{order.seats}</span>
                  </li>
                  {order.addOns.map((a) => (
                    <li key={a.name}>
                      <span>{a.name}</span>
                      <span>× {a.qty}</span>
                    </li>
                  ))}
                  {order.discount ? (
                    <li>
                      <span>Discount{order.promoCode ? ` (${order.promoCode})` : ""}</span>
                      <span>−{money(order.discount)}</span>
                    </li>
                  ) : null}
                  <li>
                    <span>Paid</span>
                    <span>{money(order.total ?? 0)}</span>
                  </li>
                </ul>
                <p className="tk-note">
                  Paid by {order.buyerName}
                  {order.buyerEmail ? ` (${order.buyerEmail})` : ""}. Bookmark this page to update guest details later.
                </p>
              </div>
              <form className="tk-card" onSubmit={save}>
                <div className="label">Your guests</div>
                <h3 style={{ fontSize: 30, margin: "10px 0 6px" }}>Who's coming?</h3>
                <p className="tk-note" style={{ marginTop: 0, marginBottom: 14 }}>
                  A name for each seat, and anything Dyllan should plan around — allergies, gluten free, vegetarian, alpha-gal.
                </p>
                {saved ? <p className="notice">Saved — thank you. You can change these any time from this page.</p> : null}
                {error ? <p className="notice err">{error}</p> : null}
                {guests.map((g, i) => (
                  <div className="guest" key={`guest-${i}`}>
                    <span className="num">{i + 1}</span>
                    <label className="field">
                      <span>Name</span>
                      <input
                        value={g.name}
                        required
                        maxLength={120}
                        onChange={(e) => {
                          setSaved(false);
                          setGuests((gs) => gs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)));
                        }}
                      />
                    </label>
                    <label className="field">
                      <span>Allergies &amp; dietary needs</span>
                      <input
                        value={g.diet}
                        maxLength={300}
                        placeholder="None"
                        onChange={(e) => {
                          setSaved(false);
                          setGuests((gs) => gs.map((x, j) => (j === i ? { ...x, diet: e.target.value } : x)));
                        }}
                      />
                    </label>
                  </div>
                ))}
                <button type="submit" className="btn full" disabled={saving} style={{ marginTop: 18 }}>
                  {saving ? "Saving…" : saved ? "Saved" : "Save guest details"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
      <Html html={renderFooter()} />
    </V2Page>
  );
}
