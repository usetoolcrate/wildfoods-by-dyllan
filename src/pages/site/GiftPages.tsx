import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { V2Page, Html, renderHeader, renderFooter } from "@/pages/v2";
import { NoIndex, TestBar, money } from "@/pages/site/TicketPages";

/* Gift certificates sold on the site: pay with Stripe Checkout, get a one-time
   code worth the amount, redeemable at checkout for Dyllan's own dinners and
   workshops. Unlinked while in test mode — /shop still points at WordPress. */

const PRESETS = [2500, 5000, 7500, 10000, 15000];

type Gift = { status: "open" | "issued" | "expired"; amountCents: number; code: string | null; recipient: string | null; from: string | null; message: string | null };

export function GiftPage() {
  const [mode, setMode] = useState<string>();
  const [amount, setAmount] = useState(5000);
  const [custom, setCustom] = useState("");
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tickets?action=events")
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => {});
  }, []);

  const cents = custom ? Math.round(Number(custom) * 100) : amount;
  const valid = Number.isFinite(cents) && cents >= 1500 && cents <= 15000 && cents % 100 === 0;

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return setError("Choose a whole-dollar amount from $15 to $150.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gift", amountCents: cents, recipient, from, message }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Couldn't start checkout. Please try again.");
      window.location.href = data.url;
    } catch {
      setError("Couldn't start checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <V2Page title="Buy a Gift Certificate — Wild Foods by Dyllan">
      {mode === "test" ? <NoIndex /> : null}
      <TestBar mode={mode} />
      <Html html={renderHeader("/shop")} />
      <section className="sec s-sand">
        <div className="c tk">
          <div>
            <div className="label">Gift certificates</div>
            <h1>Give someone a seat at the table</h1>
            <p className="tk-about">
              Pick an amount from $15 to $150. Right after paying you get a printable certificate with a one-time code, which is
              entered at checkout for tickets to Dyllan's dinners and workshops on this site.
            </p>
          </div>
          <form className="tk-card" onSubmit={buy}>
            {error ? <p className="notice err">{error}</p> : null}
            <div className="field">
              <span>Amount</span>
              <div className="amounts">
                {PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p}
                    className={!custom && amount === p ? "on" : ""}
                    onClick={() => {
                      setAmount(p);
                      setCustom("");
                    }}
                  >
                    {money(p)}
                  </button>
                ))}
              </div>
              <input
                inputMode="numeric"
                placeholder="Other amount ($15–$150)"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                aria-label="Other amount in dollars"
              />
            </div>
            <label className="field">
              <span>To</span>
              <input value={recipient} maxLength={80} onChange={(e) => setRecipient(e.target.value)} placeholder="Who it's for" />
            </label>
            <label className="field">
              <span>From</span>
              <input value={from} maxLength={80} onChange={(e) => setFrom(e.target.value)} placeholder="Your name" />
            </label>
            <label className="field">
              <span>Message (optional)</span>
              <textarea value={message} maxLength={240} rows={3} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <div className="tk-total">
              <span>Total</span>
              <strong>{valid ? money(cents) : "—"}</strong>
            </div>
            <button type="submit" className="btn full" disabled={busy || !valid}>
              {busy ? "Opening checkout…" : "Continue to payment"}
            </button>
          </form>
        </div>
      </section>
      <Html html={renderFooter()} />
    </V2Page>
  );
}

export function GiftThanksPage() {
  const [params] = useSearchParams();
  const session = params.get("session_id") ?? "";
  const [mode, setMode] = useState<string>();
  const [gift, setGift] = useState<Gift | null>();

  useEffect(() => {
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      const res = await fetch(`/api/tickets?action=gift&session=${encodeURIComponent(session)}`);
      if (!res.ok) return setGift(null);
      const data = await res.json();
      setMode(data.mode);
      setGift(data.gift);
      if (data.gift.status === "open" && tries++ < 15) timer = setTimeout(load, 2000);
    };
    load();
    return () => clearTimeout(timer);
  }, [session]);

  return (
    <V2Page title="Your Gift Certificate — Wild Foods by Dyllan">
      <NoIndex />
      <TestBar mode={mode} />
      <div className="no-print">
        <Html html={renderHeader("/shop")} />
      </div>
      <section className="sec s-sand">
        <div className="c">
          {gift === undefined ? (
            <p>Loading…</p>
          ) : gift === null ? (
            <div className="sh">
              <div className="label">Gift certificates</div>
              <h2>We couldn't find that gift certificate.</h2>
              <p>
                If you were charged, call or text <a href="tel:14174039265">417-403-9265</a>.
              </p>
            </div>
          ) : gift.status !== "issued" ? (
            <div className="sh">
              <div className="label">Gift certificates</div>
              <h2>{gift.status === "expired" ? "This checkout expired — nothing was charged." : "Finishing up your payment…"}</h2>
            </div>
          ) : (
            <>
              <div className="cert">
                <img src="/images/logo-lockup.webp" alt="Wild Foods by Dyllan" />
                <div className="label">Gift certificate</div>
                <div className="amt">{money(gift.amountCents)}</div>
                {gift.recipient || gift.from ? (
                  <div className="to">
                    {gift.recipient ? `For ${gift.recipient}` : ""}
                    {gift.recipient && gift.from ? " · " : ""}
                    {gift.from ? `From ${gift.from}` : ""}
                  </div>
                ) : null}
                {gift.message ? <p className="msg">“{gift.message}”</p> : null}
                <div className="code">{gift.code}</div>
                <p className="how">
                  Enter this code at checkout for tickets to Wild Foods by Dyllan dinners and workshops at {window.location.host}. One
                  use.
                </p>
              </div>
              <div className="no-print" style={{ textAlign: "center", marginTop: 32 }}>
                <button type="button" className="btn" onClick={() => window.print()}>
                  Print certificate
                </button>
                <p className="tk-note">Keep this page's link — the code is also saved with your order.</p>
              </div>
            </>
          )}
        </div>
      </section>
      <div className="no-print">
        <Html html={renderFooter()} />
      </div>
    </V2Page>
  );
}
