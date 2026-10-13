import { useCallback, useEffect, useState } from "react";
import { buttonStyle, secondaryButtonStyle } from "@/pages/site/AdminRecipesPage";
import { AdminShell, adminPost, badge, card, field, labelStyle, uploadImage } from "@/pages/site/AdminKit";

/* /admin and the content pages Dyllan edits himself:
   signature plates, reviews, and private dining inquiries. */

const small: React.CSSProperties = { ...secondaryButtonStyle, padding: "5px 10px", fontSize: 11 };
const muted: React.CSSProperties = { color: "var(--ink-soft)", fontSize: 14 };

function useArea<T>(area: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    const res = await fetch(`/api/admin/content?area=${area}`);
    if (!res.ok) return setError("Couldn't load. Refresh to try again.");
    setData(await res.json());
  }, [area]);
  useEffect(() => {
    load();
  }, [load]);
  return { data, error, load, setError };
}

/* ---------------- /admin ---------------- */

type Summary = { new_inquiries: number; plates: number; reviews: number; upcoming: number };

function SummaryCards() {
  const { data } = useArea<Summary>("summary");
  const tiles: [string, string, string][] = [
    ["/admin/inquiries", "Inquiries", data ? (data.new_inquiries ? `${data.new_inquiries} new` : "None new") : "…"],
    ["/admin/tickets", "Dinners & tickets", data ? `${data.upcoming} upcoming` : "…"],
    ["/admin/plates", "Signature plates", data ? `${data.plates} on the site` : "…"],
    ["/admin/reviews", "Reviews", data ? `${data.reviews} on the site` : "…"],
    ["/admin/recipes", "Recipes", "Add and edit recipes"],
    ["/admin/questions", "Questionnaire", "Answers from setup"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
      {tiles.map(([href, name, note]) => (
        <a key={href} href={href} style={{ ...card, display: "block", textDecoration: "none", color: "var(--ink)", marginBottom: 0 }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>{name}</div>
          <div style={muted}>{note}</div>
        </a>
      ))}
    </div>
  );
}

export function AdminHomePage() {
  return (
    <AdminShell title="Wild Foods admin" home>
      <h1 style={{ fontSize: 28, marginTop: 0 }}>Wild Foods admin</h1>
      <p style={{ ...muted, marginTop: -6, marginBottom: 24 }}>Everything on the site you can change yourself.</p>
      <SummaryCards />
    </AdminShell>
  );
}

/* ---------------- /admin/plates ---------------- */

type Plate = { id: number; name: string; image_url: string | null; image_alt: string; rows: { label: string; text: string }[]; published: boolean };
type PlateDraft = { id?: number; name: string; image: string; alt: string; rows: { label: string; text: string }[]; published: boolean };

const NEW_PLATE: PlateDraft = {
  name: "",
  image: "",
  alt: "",
  rows: [
    { label: "The farms", text: "" },
    { label: "The wild", text: "" },
    { label: "The plate", text: "" },
  ],
  published: true,
};

function PlateForm({ initial, onDone }: { initial: PlateDraft; onDone: () => void }) {
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await adminPost({ action: "savePlate", id: d.id, plate: d });
    setBusy(false);
    if (!r.ok) return setError(r.error ?? "Couldn't save.");
    onDone();
  }

  return (
    <form onSubmit={save} style={{ ...card, padding: 22, marginBottom: 28 }}>
      <h2 style={{ fontSize: 22, marginTop: 0 }}>{d.id ? "Edit plate" : "New plate"}</h2>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      <label style={labelStyle}>Dish name</label>
      <input style={field} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} required placeholder="Seared duck, wild rice & apple chutney" />
      <label style={labelStyle}>Photo</label>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap" }}>
        {d.image ? <img src={d.image} alt="" style={{ width: 120, height: 150, objectFit: "cover", border: "1px solid var(--line)" }} /> : null}
        <div>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError("");
              try {
                setD({ ...d, image: await uploadImage(file, "plates") });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setUploading(false);
              }
            }}
          />
          <div style={{ ...muted, marginTop: 6 }}>{uploading ? "Uploading…" : "Portrait photos look best (taller than wide)."}</div>
        </div>
      </div>
      <label style={labelStyle}>Describe the photo (for screen readers and Google)</label>
      <input style={field} value={d.alt} onChange={(e) => setD({ ...d, alt: e.target.value })} placeholder="Sliced duck breast over wild rice with chutney and sage" />
      <label style={labelStyle}>The story — a short heading and a few sentences each (empty ones are hidden)</label>
      {d.rows.map((r, i) => (
        <div key={`row-${i}`} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 10, alignItems: "start" }}>
          <input style={field} value={r.label} onChange={(e) => setD({ ...d, rows: d.rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
          <textarea
            style={{ ...field, minHeight: 64 }}
            value={r.text}
            onChange={(e) => setD({ ...d, rows: d.rows.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
          />
          <button type="button" style={{ ...small, marginBottom: 14 }} onClick={() => setD({ ...d, rows: d.rows.filter((_, j) => j !== i) })}>
            Remove
          </button>
        </div>
      ))}
      {d.rows.length < 5 ? (
        <button type="button" style={{ ...small, marginBottom: 18 }} onClick={() => setD({ ...d, rows: [...d.rows, { label: "", text: "" }] })}>
          + Add a line
        </button>
      ) : null}
      <label style={{ display: "block", fontSize: 14, marginBottom: 18 }}>
        <input type="checkbox" checked={d.published} onChange={(e) => setD({ ...d, published: e.target.checked })} /> Show on the site
      </label>
      <button type="submit" style={buttonStyle} disabled={busy || uploading}>
        {busy ? "Saving…" : "Save plate"}
      </button>{" "}
      <button type="button" style={secondaryButtonStyle} onClick={onDone}>
        Cancel
      </button>
    </form>
  );
}

export function AdminPlatesPage() {
  const { data, error, load, setError } = useArea<{ plates: Plate[] }>("plates");
  const [editing, setEditing] = useState<PlateDraft | null>(null);

  async function act(body: object, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const r = await adminPost(body);
    if (!r.ok) setError(r.error ?? "Couldn't save.");
    load();
  }

  return (
    <AdminShell title="Signature plates">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Signature plates</h1>
        <button type="button" style={buttonStyle} onClick={() => setEditing({ ...NEW_PLATE, rows: NEW_PLATE.rows.map((r) => ({ ...r })) })}>
          New plate
        </button>
      </div>
      <p style={{ ...muted, marginBottom: 22 }}>The "One plate" gallery on the home page, in this order. Visitors click through them with the arrows.</p>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      {editing ? (
        <PlateForm
          initial={editing}
          onDone={() => {
            setEditing(null);
            load();
          }}
        />
      ) : null}
      {!data ? <p>Loading…</p> : data.plates.length === 0 ? <p>No plates yet.</p> : null}
      {data?.plates.map((p, i) => (
        <div key={p.id} style={{ ...card, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {p.image_url ? <img src={p.image_url} alt="" style={{ width: 64, height: 80, objectFit: "cover" }} /> : <div style={{ width: 64, height: 80, background: "#eee" }} />}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 18 }}>
              {p.name}
              {!p.published ? <span style={badge("#7a7a7a")}>hidden</span> : null}
            </div>
            <div style={muted}>{p.rows.filter((r) => r.text).map((r) => r.label).join(" · ") || "No story yet"}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button type="button" style={small} disabled={i === 0} onClick={() => act({ action: "movePlate", id: p.id, dir: -1 })} aria-label="Move up">
              ↑
            </button>
            <button type="button" style={small} disabled={i === (data?.plates.length ?? 0) - 1} onClick={() => act({ action: "movePlate", id: p.id, dir: 1 })} aria-label="Move down">
              ↓
            </button>
            <button
              type="button"
              style={small}
              onClick={() =>
                setEditing({ id: p.id, name: p.name, image: p.image_url ?? "", alt: p.image_alt, rows: p.rows.map((r) => ({ ...r })), published: p.published })
              }
            >
              Edit
            </button>
            <button type="button" style={small} onClick={() => act({ action: "deletePlate", id: p.id }, `Delete "${p.name}"? This can't be undone.`)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </AdminShell>
  );
}

/* ---------------- /admin/reviews ---------------- */

type Review = { id: number; name: string; text: string; rating: number | null; source: string; review_date: string | null; shown: boolean };
type ReviewDraft = { id?: number; name: string; text: string; rating: string; source: string; date: string; shown: boolean };

const NEW_REVIEW: ReviewDraft = { name: "", text: "", rating: "5", source: "google", date: "", shown: true };
const SOURCE_LABEL: Record<string, string> = { google: "Google", site: "Old website", email: "Email / message" };

export function AdminReviewsPage() {
  const { data, error, load, setError } = useArea<{ reviews: Review[]; googleUrl: string }>("reviews");
  const [editing, setEditing] = useState<ReviewDraft | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState(false);

  async function act(body: object, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const r = await adminPost(body);
    if (!r.ok) setError(r.error ?? "Couldn't save.");
    load();
  }

  const shownCount = data?.reviews.filter((r) => r.shown).length ?? 0;

  return (
    <AdminShell title="Reviews">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Reviews</h1>
        <button type="button" style={buttonStyle} onClick={() => setEditing({ ...NEW_REVIEW })}>
          Add a review
        </button>
      </div>
      <p style={{ ...muted, marginBottom: 22 }}>
        "From the table" on the home page shows the first 4 reviews marked to show ({shownCount} right now). Copy a favorite from Google, paste it in,
        and move it up.
      </p>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}

      <div style={{ ...card, padding: 18 }}>
        <label style={labelStyle}>Link to your Google reviews (from "Share" on your Google Business Profile)</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={{ ...field, marginBottom: 0 }}
            value={googleUrl ?? data?.googleUrl ?? ""}
            onChange={(e) => {
              setGoogleUrl(e.target.value);
              setSavedUrl(false);
            }}
            placeholder="https://g.page/r/…"
          />
          <button
            type="button"
            style={small}
            onClick={async () => {
              const r = await adminPost({ action: "saveSetting", key: "google_reviews_url", value: googleUrl ?? data?.googleUrl ?? "" });
              if (!r.ok) return setError(r.error ?? "Couldn't save.");
              setSavedUrl(true);
            }}
          >
            {savedUrl ? "Saved" : "Save"}
          </button>
        </div>
        <div style={{ ...muted, marginTop: 6 }}>Adds a "Read all reviews on Google" link under the reviews.</div>
      </div>

      {editing ? (
        <form
          style={{ ...card, padding: 22, marginBottom: 28 }}
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await adminPost({ action: "saveReview", id: editing.id, review: editing });
            if (!r.ok) return setError(r.error ?? "Couldn't save.");
            setEditing(null);
            load();
          }}
        >
          <h2 style={{ fontSize: 22, marginTop: 0 }}>{editing.id ? "Edit review" : "Add a review"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0 14px" }}>
            <div>
              <label style={labelStyle}>Name (as shown)</label>
              <input style={field} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required placeholder="Sarah M." />
            </div>
            <div>
              <label style={labelStyle}>Stars</label>
              <select style={field} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: e.target.value })}>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="">Don't show stars</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>From</label>
              <select style={field} value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })}>
                {Object.entries(SOURCE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date (optional)</label>
              <input type="date" style={field} value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            </div>
          </div>
          <label style={labelStyle}>Review</label>
          <textarea style={{ ...field, minHeight: 110 }} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} required />
          <label style={{ display: "block", fontSize: 14, marginBottom: 18 }}>
            <input type="checkbox" checked={editing.shown} onChange={(e) => setEditing({ ...editing, shown: e.target.checked })} /> Show on the site
          </label>
          <button type="submit" style={buttonStyle}>
            Save review
          </button>{" "}
          <button type="button" style={secondaryButtonStyle} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </form>
      ) : null}

      {!data ? <p>Loading…</p> : data.reviews.length === 0 ? <p>No reviews yet.</p> : null}
      {data?.reviews.map((r, i) => (
        <div key={r.id} style={{ ...card, opacity: r.shown ? 1 : 0.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <strong>
              {r.rating ? `${"★".repeat(r.rating)} ` : ""}
              {r.name}
              <span style={badge(r.shown ? "#3a5a40" : "#7a7a7a")}>{r.shown ? "showing" : "hidden"}</span>
            </strong>
            <span style={muted}>
              {SOURCE_LABEL[r.source] ?? r.source}
              {r.review_date ? ` · ${r.review_date}` : ""}
            </span>
          </div>
          <p style={{ margin: "8px 0 12px", fontSize: 15 }}>{r.text}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button type="button" style={small} disabled={i === 0} onClick={() => act({ action: "moveReview", id: r.id, dir: -1 })} aria-label="Move up">
              ↑
            </button>
            <button type="button" style={small} disabled={i === (data?.reviews.length ?? 0) - 1} onClick={() => act({ action: "moveReview", id: r.id, dir: 1 })} aria-label="Move down">
              ↓
            </button>
            <button
              type="button"
              style={small}
              onClick={() => act({ action: "saveReview", id: r.id, review: { name: r.name, text: r.text, rating: r.rating ?? "", source: r.source, date: r.review_date ?? "", shown: !r.shown } })}
            >
              {r.shown ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              style={small}
              onClick={() => setEditing({ id: r.id, name: r.name, text: r.text, rating: r.rating ? String(r.rating) : "", source: r.source, date: r.review_date ?? "", shown: r.shown })}
            >
              Edit
            </button>
            <button type="button" style={small} onClick={() => act({ action: "deleteReview", id: r.id }, `Delete the review from ${r.name}?`)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </AdminShell>
  );
}

/* ---------------- /admin/inquiries ---------------- */

type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  guests: number | null;
  experience: string | null;
  location: string | null;
  details: string | null;
  status: string;
  notified: boolean;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = { new: "New", replied: "Replied", booked: "Booked", closed: "Closed" };
const STATUS_COLOR: Record<string, string> = { new: "#a85a22", replied: "#5b6b4a", booked: "#1f3327", closed: "#7a7a7a" };

export function AdminInquiriesPage() {
  const { data, error, load, setError } = useArea<{ inquiries: Inquiry[] }>("inquiries");
  const [filter, setFilter] = useState("open");

  const list = (data?.inquiries ?? []).filter((q) => (filter === "open" ? q.status === "new" || q.status === "replied" : filter === "all" ? true : q.status === filter));

  return (
    <AdminShell title="Inquiries">
      <h1 style={{ fontSize: 28, margin: 0 }}>Private dining inquiries</h1>
      <p style={{ ...muted, marginBottom: 18 }}>From the form on the Private Chef page. Each one is also emailed to you; reply to that email to answer the guest.</p>
      {error ? <p style={{ color: "var(--rust-deep)" }}>{error}</p> : null}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {[
          ["open", "Open"],
          ["booked", "Booked"],
          ["closed", "Closed"],
          ["all", "All"],
        ].map(([k, v]) => (
          <button key={k} type="button" style={{ ...small, background: filter === k ? "var(--ink)" : "transparent", color: filter === k ? "#fff" : "var(--ink)" }} onClick={() => setFilter(k)}>
            {v}
          </button>
        ))}
      </div>
      {!data ? <p>Loading…</p> : list.length === 0 ? <p>Nothing here.</p> : null}
      {list.map((q) => (
        <article key={q.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 18 }}>
              {q.name}
              <span style={badge(STATUS_COLOR[q.status] ?? "#7a7a7a")}>{STATUS_LABEL[q.status] ?? q.status}</span>
            </strong>
            <span style={muted}>
              {new Date(q.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              {q.notified ? "" : " · not emailed"}
            </span>
          </div>
          <div style={{ margin: "8px 0", fontSize: 15 }}>
            {[q.event_date, q.guests ? `${q.guests} guests` : null, q.experience, q.location].filter(Boolean).join(" · ") || "No date or details given"}
          </div>
          {q.details ? <p style={{ margin: "0 0 10px", fontSize: 15, whiteSpace: "pre-line" }}>{q.details}</p> : null}
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            <a href={`mailto:${q.email}`}>{q.email}</a>
            {q.phone ? (
              <>
                {" · "}
                <a href={`tel:${q.phone.replace(/[^0-9+]/g, "")}`}>{q.phone}</a>
              </>
            ) : null}
          </div>
          <label style={{ ...labelStyle, display: "inline", marginRight: 8 }}>Status</label>
          <select
            value={q.status}
            style={{ ...field, width: "auto", marginBottom: 0, padding: "4px 8px" }}
            onChange={async (e) => {
              const r = await adminPost({ action: "setInquiryStatus", id: q.id, status: e.target.value });
              if (!r.ok) setError(r.error ?? "Couldn't save.");
              load();
            }}
          >
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </article>
      ))}
    </AdminShell>
  );
}
