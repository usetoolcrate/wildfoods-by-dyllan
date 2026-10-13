import { useEffect, useRef, useState } from "react";

/* Private dining inquiry: date, guests, the experience they want, and what
   they're picturing. Saved to /admin/inquiries and emailed to Dyllan. */

const EXPERIENCES = ["Harvest Buffet", "Gathered Family Style", "Chef's Table Plated", "Catering", "Not sure yet"];

const EMPTY = { name: "", email: "", phone: "", date: "", guests: "", experience: "Not sure yet", location: "", details: "", website: "" };

export function InquiryForm() {
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef<HTMLElement>(null);

  // Links from other pages land on /private-chef#inquire.
  useEffect(() => {
    if (window.location.hash === "#inquire") setTimeout(() => ref.current?.scrollIntoView({ block: "start" }), 50);
  }, []);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inquiry", ...f }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Couldn't send. Please try again, or call 417-403-9265.");
      setSent(true);
    } catch {
      setError("Couldn't send. Please try again, or call 417-403-9265.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sec s-white" id="inquire" ref={ref}>
      <div className="c tk">
        <div>
          <div className="label">Private dining</div>
          <h2 style={{ margin: "18px 0 22px" }}>Check your date</h2>
          <p className="tk-about">
            Tell Dyllan when, how many, and what you're picturing. He'll get back to you to talk through the menu, the
            experience, and the details of your evening.
          </p>
          <p className="tk-note" style={{ marginTop: 22 }}>
            Prefer to talk? Call or text <a href="tel:14174039265">417-403-9265</a>.
          </p>
        </div>
        {sent ? (
          <div className="tk-card">
            <div className="label">Thank you</div>
            <h3 style={{ fontSize: 32, margin: "12px 0 10px" }}>Your inquiry is in.</h3>
            <p className="tk-about">Dyllan will be in touch soon at {f.email}.</p>
          </div>
        ) : (
          <form className="tk-card" onSubmit={submit}>
            {error ? <p className="notice err">{error}</p> : null}
            <div className="form-grid">
              <label className="field">
                <span>Name</span>
                <input value={f.name} onChange={set("name")} required maxLength={120} autoComplete="name" />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" value={f.email} onChange={set("email")} required maxLength={200} autoComplete="email" />
              </label>
              <label className="field">
                <span>Phone</span>
                <input type="tel" value={f.phone} onChange={set("phone")} maxLength={40} autoComplete="tel" />
              </label>
              <label className="field">
                <span>Date</span>
                <input value={f.date} onChange={set("date")} maxLength={60} placeholder="e.g. Sat, Dec 19 — or flexible" />
              </label>
              <label className="field">
                <span>Guests</span>
                <input inputMode="numeric" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })} />
              </label>
              <label className="field">
                <span>Experience</span>
                <select value={f.experience} onChange={set("experience")}>
                  {EXPERIENCES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Where</span>
              <input value={f.location} onChange={set("location")} maxLength={160} placeholder="City, home, or venue" />
            </label>
            <label className="field">
              <span>What are you picturing?</span>
              <textarea
                rows={4}
                value={f.details}
                onChange={set("details")}
                maxLength={3000}
                placeholder="The occasion, foods you love, allergies or dietary needs"
              />
            </label>
            <label className="hp" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
            </label>
            <button type="submit" className="btn full" disabled={busy}>
              {busy ? "Sending…" : "Send inquiry"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
